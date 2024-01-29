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
  isTransactionSimulationError,
  simulateAndReviewSchema,
} from "../../../../shared/transactionReview/schema"
import { ReviewError } from "../../../../shared/errors/review"
import { addEstimatedFee } from "../../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { AccountError } from "../../../../shared/errors/account"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { KeyValueStorage } from "../../../../shared/storage"
import { ITransactionReviewWorker } from "./worker/interface"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../../shared/api/constants"
import { ETH_TOKEN_ADDRESS } from "../../../../shared/network/constants"
import { getEstimatedFeeFromSimulationAndRespectWatermarkFee } from "../../../../shared/transactionSimulation/utils"

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

      if (!selectedAccount) {
        throw new AccountError({ code: "NOT_FOUND" })
      }

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress: ETH_TOKEN_ADDRESS,
          amount: 0n,
          pricePerUnit: 0n,
        },
      }

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
          const [deployEstimate, txEstimate] =
            await starknetAccount.estimateFeeBulk(bulkTransactions, {
              skipValidate: true,
            })

          if (
            !deployEstimate.gas_consumed ||
            !deployEstimate.gas_price ||
            !txEstimate.gas_consumed ||
            !txEstimate.gas_price
          ) {
            throw new ReviewError({
              code: "ONCHAIN_FEE_ESTIMATION_FAILED",
              message: "Missing gas_consumed or gas_price",
            })
          }

          fees.deployment = {
            feeTokenAddress: ETH_TOKEN_ADDRESS,
            amount: deployEstimate.gas_consumed,
            pricePerUnit: deployEstimate.gas_price,
          }
          fees.transactions = {
            feeTokenAddress: ETH_TOKEN_ADDRESS,
            amount: txEstimate.gas_consumed,
            pricePerUnit: txEstimate.gas_price,
          }
        }
      } else {
        const { gas_consumed, gas_price } = await starknetAccount.estimateFee(
          calls,
          {
            skipValidate: true,
          },
        )

        if (!gas_consumed || !gas_price) {
          throw new ReviewError({
            code: "ONCHAIN_FEE_ESTIMATION_FAILED",
            message: "Missing gas_consumed or gas_price",
          })
        }

        fees.transactions = {
          feeTokenAddress: ETH_TOKEN_ADDRESS,
          amount: gas_consumed,
          pricePerUnit: gas_price,
        }
      }

      await addEstimatedFee(fees, calls)

      return fees
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
    const fee = getEstimatedFeeFromSimulationAndRespectWatermarkFee(
      simulateAndReviewResult,
    )

    await addEstimatedFee(
      fee,
      initialTransactions[isDeploymentTransaction ? 1 : 0].calls ?? [],
    )

    return fee
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

      // if there is a simulation error then there is also no actual simulation
      // or fee information, and no way to proceed with fee estimation
      // returning the result will surface the error to the user in the ui
      const hasSimulationError = result.transactions.some((transaction) =>
        isTransactionSimulationError(transaction),
      )
      if (hasSimulationError) {
        return result
      }

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
      console.error(e)
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
