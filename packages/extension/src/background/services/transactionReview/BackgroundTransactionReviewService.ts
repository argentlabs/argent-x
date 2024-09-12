import urlJoin from "url-join"

import {
  Address,
  ensureArray,
  estimatedFeeToMaxResourceBounds,
  getEstimatedFeeFromSimulationAndRespectWatermarkFee,
  getPayloadFromTransaction,
  getTxVersionFromFeeToken,
  hexSchema,
  type IHttpService,
} from "@argent/x-shared"
import {
  Account,
  BigNumberish,
  CairoVersion,
  Call,
  Calldata,
  Invocations,
  json,
  num,
  TransactionType,
} from "starknet"
import { base64 } from "@scure/base"

import {
  EnrichedSimulateAndReview,
  EstimatedFees,
  getErrorMessageAndLabelFromSimulation,
  isTransactionSimulationError,
  SimulateAndReview,
  simulateAndReviewSchema,
} from "@argent/x-shared/simulation"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../shared/api/constants"
import { AccountError } from "../../../shared/errors/account"
import { ReviewError } from "../../../shared/errors/review"
import { isArgentNetwork } from "../../../shared/network/utils"
import { KeyValueStorage } from "../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewService,
  ITransactionReviewWarningsStore,
  TransactionReviewTransactions,
} from "../../../shared/transactionReview/interface"
import type { StarknetTransactionTypes } from "../../../shared/transactions"
import {
  addEstimatedFee,
  getEstimatedFees,
} from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { getNonce } from "../../nonce"
import { Wallet } from "../../wallet"
import { ITransactionReviewWorker } from "./worker/ITransactionReviewWorker"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { base64url } from "@scure/base"
import { deflateSync } from "fflate"
import { browserExtensionSentryWithScope } from "../../../shared/sentry/scope"
import { urlWithQuery } from "../../../shared/utils/url"

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
    private readonly warningsStore: KeyValueStorage<ITransactionReviewWarningsStore>,
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
          dataGasConsumed: 0n,
          dataGasPrice: 0n,
        },
      }

      if (!isDeployed) {
        if ("estimateFeeBulk" in starknetAccount) {
          const bulkTransactions: Invocations = [
            {
              type: TransactionType.DEPLOY_ACCOUNT,
              payload:
                await this.wallet.getAccountDeploymentPayload(selectedAccount),
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
            dataGasConsumed: deployEstimate.data_gas_consumed,
            dataGasPrice: deployEstimate.data_gas_price,
          }
          fees.transactions = {
            feeTokenAddress,
            amount: txEstimate.gas_consumed,
            pricePerUnit: txEstimate.gas_price,
            dataGasConsumed: txEstimate.data_gas_consumed,
            dataGasPrice: txEstimate.data_gas_price,
          }
        }
      } else {
        const { gas_consumed, gas_price, data_gas_consumed, data_gas_price } =
          await starknetAccount.estimateFee(calls, {
            skipValidate: true,
            version,
          })

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
          dataGasConsumed: data_gas_consumed,
          dataGasPrice: data_gas_price,
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
    appDomain,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
    appDomain?: string
  }): Promise<EnrichedSimulateAndReview> {
    const selectedAccount = await this.wallet.getSelectedAccount()
    const account = await this.wallet.getSelectedStarknetAccount()
    const isDeploymentTransaction = transactions.some(
      (tx) => tx.type === "DEPLOY_ACCOUNT",
    )

    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    let isDelayedTransaction = false
    try {
      const multisig = await this.wallet.getMultisigAccount(selectedAccount)
      isDelayedTransaction =
        selectedAccount.type === "multisig" &&
        multisig &&
        multisig.threshold > 1
    } catch (e) {
      // do nothing
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
          getPayloadFromTransaction({
            transaction,
            nonce,
            version,
            chainId,
            appDomain,
            isDeploymentTransaction,
            cairoVersion: account.cairoVersion,
            address: account.address,
          }),
        ),
      }

      const endpointWithParams = isDelayedTransaction
        ? urlWithQuery(simulateAndReviewEndpoint, { delayedTransactions: true })
        : simulateAndReviewEndpoint

      const result = await this.httpService.post<SimulateAndReview>(
        endpointWithParams,
        {
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
        try {
          // try and send the error and label to Sentry
          const errorMessageAndLabel =
            getErrorMessageAndLabelFromSimulation(result)
          if (errorMessageAndLabel) {
            const { label, message } = errorMessageAndLabel
            browserExtensionSentryWithScope((scope) => {
              scope.setLevel("warning")
              /** Sentry will scrub this if left as raw data, so it is sent base64 encoded */
              scope.setExtras({
                base64: base64.encode(
                  new TextEncoder().encode(
                    JSON.stringify(
                      {
                        label,
                        message,
                        response: result,
                      },
                      null,
                      2,
                    ),
                  ),
                ),
              })
              scope.captureException(
                new Error(`simulateAndReview error: ${label}`),
              )
            })
          }
        } catch {
          // ignore error
        }

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

  async getTransactionHash(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    const transactions = ensureArray(calls)
    const account = await this.wallet.getAccount(baseAccount)

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const starknetAccount = await this.wallet.getStarknetAccount(account)

    const details = await this.buildTransactionDetails(
      account,
      transactions,
      estimatedFee,
      providedNonce,
    )

    if (!details) {
      return null
    }

    const { nonce, resourceBounds, maxFee, version } = details

    let txHash

    try {
      txHash = await starknetAccount.getInvokeTransactionHash(transactions, {
        nonce,
        version,
        maxFee,
        resourceBounds,
      })
    } catch (error) {
      console.error(error)
      return null
    }

    return hexSchema.parse(txHash)
  }

  async buildTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    const transactions = ensureArray(calls)
    const account = await this.wallet.getAccount(baseAccount)

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const starknetAccount = await this.wallet.getStarknetAccount(account)

    const details = await this.buildTransactionDetails(
      account,
      transactions,
      estimatedFee,
      providedNonce,
    )

    if (!details) {
      return null
    }

    const { nonce, resourceBounds, maxFee, version } = details

    const tx = await starknetAccount.buildInvokeTransactionPayload(
      transactions,
      { nonce, version, maxFee, resourceBounds },
    )

    return tx
  }

  async getCompressedTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    try {
      const tx = await this.buildTransactionPayload(
        baseAccount,
        calls,
        estimatedFee,
        providedNonce,
      )

      if (!tx) {
        return null
      }

      const stringifiedTx = json.stringify(tx)

      // deflate has a better compression ratio than gzip
      const compressed = deflateSync(new TextEncoder().encode(stringifiedTx), {
        level: 9,
      })

      return base64url.encode(compressed)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  private async buildTransactionDetails(
    account: WalletAccount,
    transactions: Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    const starknetAccount = await this.wallet.getStarknetAccount(account)

    const fees =
      estimatedFee ??
      (await getEstimatedFees({
        type: TransactionType.INVOKE,
        payload: transactions,
      }))
    if (!fees) {
      return null
    }

    const version = getTxVersionFromFeeToken(fees.transactions.feeTokenAddress)

    const nonce = account.needsDeploy
      ? num.toHex(1)
      : providedNonce
        ? num.toHex(providedNonce)
        : await getNonce(account, starknetAccount)
    return {
      nonce,
      version,
      ...estimatedFeeToMaxResourceBounds(fees.transactions),
    }
  }

  async getLabels() {
    await this.worker.maybeUpdateLabels()
    return await this.labelsStore.get("labels")
  }

  async getWarnings() {
    await this.worker.maybeUpdateWarnings()
    return await this.warningsStore.get("warnings")
  }
}
