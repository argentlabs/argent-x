import urlJoin from "url-join"

import { type IHttpService, ensureArray, Address } from "@argent/shared"
import {
  Account,
  CairoVersion,
  Call,
  Calldata,
  Invocations,
  TransactionType,
  num,
} from "starknet6"

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
import { getEstimatedFeeFromSimulationAndRespectWatermarkFee } from "../../../../shared/transactionSimulation/utils"
import { getTxVersionFromFeeToken } from "../../../../shared/utils/getTransactionVersion"
import { isArgentNetwork } from "../../../../shared/network/utils"
import { getNonce } from "../../../nonce"

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
    feeTokenAddress,
  }: {
    starknetAccount: Account
    calls: Call[]
    isDeployed: boolean
    feeTokenAddress: Address
  }) {
    try {
      const selectedAccount = await this.wallet.getSelectedAccount()

      if (!selectedAccount) {
        throw new AccountError({ code: "NOT_FOUND" })
      }

      const version = getTxVersionFromFeeToken(feeTokenAddress)

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress,
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
          const [deployEstimate, txEstimate] = await starknetAccount
            .estimateFeeBulk(bulkTransactions, {
              version,
            })
            .catch((error) => {
              console.error(error)
              throw error
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
            feeTokenAddress,
            amount: deployEstimate.gas_consumed,
            pricePerUnit: deployEstimate.gas_price,
          }
          fees.transactions = {
            feeTokenAddress,
            amount: txEstimate.gas_consumed,
            pricePerUnit: txEstimate.gas_price,
          }
        }
      } else {
        const { gas_consumed, gas_price } = await starknetAccount.estimateFee(
          calls,
          {
            skipValidate: true,
            version,
          },
        )

        if (!gas_consumed || !gas_price) {
          throw new ReviewError({
            code: "ONCHAIN_FEE_ESTIMATION_FAILED",
            message: "Missing gas_consumed or gas_price",
          })
        }

        fees.transactions = {
          feeTokenAddress,
          amount: gas_consumed,
          pricePerUnit: gas_price,
        }
      }

      await addEstimatedFee(fees, {
        type: TransactionType.INVOKE,
        payload: calls,
      })

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

    await addEstimatedFee(fee, {
      type: TransactionType.INVOKE,
      payload: initialTransactions[isDeploymentTransaction ? 1 : 0].calls ?? [],
    })

    return fee
  }

  async simulateAndReview({
    transactions,
    feeTokenAddress,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
  }) {
    const selectedAccount = await this.wallet.getSelectedAccount()
    const account = await this.wallet.getSelectedStarknetAccount()
    const isDeploymentTransaction = transactions.some(
      (tx) => tx.type === "DEPLOY_ACCOUNT",
    )

    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    try {
      if (!isArgentNetwork(selectedAccount?.network)) {
        // If it's not an argent network we fallback to onchain fee estimation
        console.warn(
          `Falling back to onchain fee estimation as ${selectedAccount?.network.id} is not an argent network`,
        )
        return this.fallbackToOnchainFeeEstimation({
          account,
          transactions,
          isDeploymentTransaction,
          feeTokenAddress,
        })
      }

      const version = getTxVersionFromFeeToken(feeTokenAddress)

      const nonce = isDeploymentTransaction
        ? "0x0"
        : await getNonce(selectedAccount, account)

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
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        simulateAndReviewSchema,
      )

      // if there is any simulation error then we should fall-back to on-chain so the user is not blocked
      const hasSimulationError = result.transactions.some((transaction) =>
        isTransactionSimulationError(transaction),
      )
      if (hasSimulationError) {
        console.warn(
          `Falling back to onchain fee estimation as there was an error in the backend simulation response:`,
          result,
        )
        throw new ReviewError({
          code: "BACKEND_SIMULATION_ERROR",
        })
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
      return this.fallbackToOnchainFeeEstimation({
        transactions,
        account,
        isDeploymentTransaction,
        feeTokenAddress,
      })
    }
  }

  async fallbackToOnchainFeeEstimation({
    transactions,
    account,
    isDeploymentTransaction,
    feeTokenAddress,
  }: {
    transactions: TransactionReviewTransactions[]
    account: Account
    isDeploymentTransaction: boolean
    feeTokenAddress: Address
  }) {
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
        feeTokenAddress,
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

  async getLabels() {
    await this.worker.maybeUpdateLabels()
    const labels = await this.labelsStore.get("labels")
    return labels
  }
}
