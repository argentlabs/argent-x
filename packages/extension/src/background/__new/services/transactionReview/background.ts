import urlJoin from "url-join"

import { type IHttpService, ensureArray } from "@argent/shared"
import {
  Account,
  CairoVersion,
  Call,
  Calldata,
  Invocations,
  TransactionType,
  hash,
  num,
} from "starknet"

import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewService,
  TransactionReviewTransactions,
} from "../../../../shared/transactionReview/interface"
import type { StarknetTransactionTypes } from "../../../../shared/transactions"
import { Wallet } from "../../../wallet"
import {
  SimulateAndReview,
  simulateAndReviewSchema,
} from "../../../../shared/transactionReview/schema"
import { ReviewError } from "../../../../shared/errors/review"
import { addEstimatedFees } from "../../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { argentMaxFee } from "../../../../shared/utils/argentMaxFee"
import { AccountError } from "../../../../shared/errors/account"
import { transactionCallsAdapter } from "../../../transactions/transactionAdapter"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { KeyValueStorage } from "../../../../shared/storage"
import { ITransactionReviewWorker } from "./worker/interface"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../../shared/api/constants"

interface ApiTransactionReviewV2RequestBody {
  transactions: Array<{
    type: StarknetTransactionTypes
    chainId: string
    cairoVersion: CairoVersion
    nonce: string
    version: string
    account: string
    calls?: Call[]
    calldata?: Calldata
  }>
}

const simulateAndReviewEndpoint = urlJoin(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL || "",
  "transactions/v2/review/starknet",
)

export default class BackgroundTransactionReviewService
  implements ITransactionReviewService
{
  constructor(
    private wallet: Wallet,
    private httpService: IHttpService,
    private readonly labelsStore: KeyValueStorage<ITransactionReviewLabelsStore>,
    private worker: ITransactionReviewWorker,
  ) {}

  private async fetchFeesOnchain({
    starknetAccount,
    calls,
    isDeployed,
  }: {
    starknetAccount: Account
    calls: Call[]
    isDeployed: boolean
  }) {
    try {
      const selectedAccount = await this.wallet.getSelectedAccount()
      const oldAccountTransactions = transactionCallsAdapter(calls)

      if (!selectedAccount) {
        throw new AccountError({ code: "NOT_FOUND" })
      }
      let txFee = "0",
        maxTxFee = "0",
        accountDeploymentFee: string | undefined,
        maxADFee: string | undefined

      if (!isDeployed) {
        if ("estimateFeeBulk" in starknetAccount) {
          const bulkTransactions: Invocations = [
            {
              type: TransactionType.DEPLOY_ACCOUNT,
              payload: await this.wallet.getAccountDeploymentPayload(
                selectedAccount,
              ),
            },
            {
              type: TransactionType.INVOKE,
              payload: calls,
            },
          ]
          const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
            bulkTransactions,
            { skipValidate: true },
          )

          accountDeploymentFee = num.toHex(estimateFeeBulk[0].overall_fee)
          txFee = num.toHex(estimateFeeBulk[1].overall_fee)

          maxADFee = argentMaxFee({
            suggestedMaxFee: estimateFeeBulk[0].suggestedMaxFee,
          })
          maxTxFee = argentMaxFee({
            suggestedMaxFee: estimateFeeBulk[1].suggestedMaxFee,
          })
        }
      } else {
        const { overall_fee, suggestedMaxFee } =
          await starknetAccount.estimateFee(calls, {
            skipValidate: true,
          })

        txFee = num.toHex(overall_fee)
        maxTxFee = num.toHex(suggestedMaxFee) // Here, maxFee = estimatedFee * 1.5x
      }

      const suggestedMaxFee = argentMaxFee({ suggestedMaxFee: maxTxFee })

      await addEstimatedFees(
        {
          amount: txFee,
          suggestedMaxFee,
          accountDeploymentFee,
          maxADFee,
        },
        calls,
      )
      return {
        amount: txFee,
        suggestedMaxFee,
        accountDeploymentFee,
        maxADFee,
      }
    } catch (error) {
      throw new ReviewError({
        code: "ONCHAIN_FEE_ESTIMATION_FAILED",
        message: `${error}`,
      })
    }
  }

  private getCallsFromTx(tx: TransactionReviewTransactions) {
    let calls
    if (tx.calls) {
      calls = ensureArray(tx.calls)
    }
    return calls
  }

  private getPayloadFromTransaction({
    transaction,
    nonce,
    chainId,
    version,
    isDeploymentTransaction,
    cairoVersion,
    address,
  }: {
    transaction: TransactionReviewTransactions
    nonce: string
    chainId: string
    version: string
    isDeploymentTransaction: boolean
    cairoVersion: CairoVersion
    address: string
  }) {
    let transactionNonce = nonce
    if (isDeploymentTransaction && transaction.type !== "DEPLOY_ACCOUNT") {
      transactionNonce = num.toHex(1)
    }
    const calls = this.getCallsFromTx(transaction)

    return {
      type: transaction.type,
      chainId,
      cairoVersion: cairoVersion,
      nonce: transactionNonce,
      version,
      account: address,
      calls,
      calldata: transaction.calldata,
      salt: transaction.salt,
      signature: transaction.signature,
      classHash: transaction.classHash,
    }
  }

  private async getEnrichedFeeEstimation(
    initialTransactions: TransactionReviewTransactions[],
    simulateAndReviewResult: SimulateAndReview,
    isDeploymentTransaction: boolean,
  ): Promise<EstimatedFees> {
    const { transactions } = simulateAndReviewResult

    let invokeTransaction, accountDeploymentFee, maxADFee

    if (isDeploymentTransaction) {
      invokeTransaction = transactions[1]
      accountDeploymentFee =
        transactions[0].simulation?.feeEstimation.maxFee.toString()
      maxADFee = accountDeploymentFee || "0"
    } else {
      invokeTransaction = transactions[0]
    }

    const amount =
      invokeTransaction.simulation?.feeEstimation.overallFee.toString() ?? "0"
    const suggestedMaxFee =
      invokeTransaction.simulation?.feeEstimation.maxFee ?? "0"

    await addEstimatedFees(
      {
        amount,
        suggestedMaxFee,
        accountDeploymentFee,
        maxADFee,
      },
      initialTransactions[isDeploymentTransaction ? 1 : 0].calls ?? [],
    )
    return {
      amount,
      suggestedMaxFee,
      accountDeploymentFee,
      maxADFee,
    }
  }

  async simulateAndReview({
    transactions,
  }: {
    transactions: TransactionReviewTransactions[]
  }) {
    const account = await this.wallet.getSelectedStarknetAccount()
    const isDeploymentTransaction = Boolean(
      transactions.find((tx) => tx.type === "DEPLOY_ACCOUNT"),
    )
    try {
      const nonce = isDeploymentTransaction ? "0x0" : await account.getNonce()
      const version = num.toHex(hash.feeTransactionVersion)

      if (!("getChainId" in account)) {
        throw new AccountError({
          message: "MISSING_METHOD",
        })
      }

      if (typeof account.cairoVersion === "undefined") {
        throw new AccountError({
          message: "MISSING_METHOD",
        })
      }
      const chainId = await account.getChainId()

      const body: ApiTransactionReviewV2RequestBody = {
        transactions: transactions.map((transaction) =>
          this.getPayloadFromTransaction({
            transaction,
            nonce,
            version,
            chainId,
            isDeploymentTransaction,
            cairoVersion: account.cairoVersion,
            address: account.address,
          }),
        ),
      }
      const result = await this.httpService.post<SimulateAndReview>(
        simulateAndReviewEndpoint,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        simulateAndReviewSchema,
      )
      const enrichedFeeEstimation = await this.getEnrichedFeeEstimation(
        transactions,
        result,
        isDeploymentTransaction,
      )
      return {
        ...result,
        enrichedFeeEstimation,
      }
    } catch (e) {
      console.log(e)
      try {
        const invokeCalls = isDeploymentTransaction
          ? this.getCallsFromTx(transactions[1])
          : this.getCallsFromTx(transactions[0])

        if (!invokeCalls) {
          throw new ReviewError({
            code: "NO_CALLS_FOUND",
          })
        }
        // Backend is failing we use the fallback method to estimate fees
        const enrichedFeeEstimation = await this.fetchFeesOnchain({
          starknetAccount: account,
          calls: invokeCalls,
          isDeployed: !isDeploymentTransaction,
        })
        return {
          transactions: [],
          enrichedFeeEstimation,
          isBackendDown: true,
        }
      } catch (error) {
        console.error(error)
        throw new ReviewError({
          message: `${error}`,
          code: "SIMULATE_AND_REVIEW_FAILED",
        })
      }
    }
  }

  async getLabels() {
    await this.worker.maybeUpdateLabels()
    const labels = await this.labelsStore.get("labels")
    return labels
  }
}
