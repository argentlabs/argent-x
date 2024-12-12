import urlJoin from "url-join"

import type { Address, TransactionAction } from "@argent/x-shared"
import {
  ensureArray,
  estimatedFeeToMaxResourceBounds,
  getEstimatedFeeFromSimulationAndRespectWatermarkFee,
  getTxVersionFromFeeToken,
  hexSchema,
  type IHttpService,
} from "@argent/x-shared"
import type { Account, BigNumberish, Call, Invocations } from "starknet"
import { json, num, TransactionType } from "starknet"
import { base64 } from "@scure/base"

import type {
  EnrichedSimulateAndReview,
  EstimatedFees,
  SimulateAndReview,
} from "@argent/x-shared/simulation"
import {
  getErrorMessageAndLabelFromSimulation,
  isTransactionSimulationError,
  simulateAndReviewSchema,
} from "@argent/x-shared/simulation"
import { ARGENT_TRANSACTION_REVIEW_API_BASE_URL } from "../../../shared/api/constants"
import { AccountError } from "../../../shared/errors/account"
import { ReviewError } from "../../../shared/errors/review"
import { isArgentNetwork } from "../../../shared/network/utils"
import type { KeyValueStorage } from "../../../shared/storage"
import type {
  ITransactionReviewLabelsStore,
  ITransactionReviewService,
  ITransactionReviewWarningsStore,
} from "../../../shared/transactionReview/interface"
import {
  addEstimatedFee,
  getEstimatedFees,
} from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import type { Wallet } from "../../wallet"
import type { ITransactionReviewWorker } from "./worker/ITransactionReviewWorker"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { base64url } from "@scure/base"
import { deflateSync } from "fflate"
import { browserExtensionSentryWithScope } from "../../../shared/sentry/scope"
import { walletAccountToArgentAccount } from "../../../shared/utils/isExternalAccount"
import { urlWithQuery } from "../../../shared/utils/url"
import type { INonceManagementService } from "../../nonceManagement/INonceManagementService"
import type {
  AccountDeployTransaction,
  InvokeTransaction,
} from "../../../shared/transactionReview/transactionAction.model"
import { assertNever } from "../../../shared/utils/assertNever"
import type { ApiTransaction } from "./types"

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
    private nonceManagementService: INonceManagementService,
    private readonly labelsStore: KeyValueStorage<ITransactionReviewLabelsStore>,
    private readonly warningsStore: KeyValueStorage<ITransactionReviewWarningsStore>,
    private worker: ITransactionReviewWorker,
  ) {}

  private async fetchFeesOnchain({
    starknetAccount,
    action,
    isDeployed,
    feeTokenAddress,
  }: {
    starknetAccount: Account
    action: TransactionAction
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
              payload: await this.wallet.getAccountDeploymentPayload(
                walletAccountToArgentAccount(selectedAccount),
              ),
            },
            action,
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
          await this.getEstimateFromAction(action, starknetAccount)

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

      await addEstimatedFee(fees, action)

      return fees
    } catch (error) {
      throw new ReviewError({
        code: "ONCHAIN_FEE_ESTIMATION_FAILED",
        message: `${error}`,
      })
    }
  }

  private getEstimateFromAction(action: TransactionAction, account: Account) {
    switch (action.type) {
      case TransactionType.INVOKE:
        return account.estimateInvokeFee(action.payload)
      case TransactionType.DEPLOY:
        return account.estimateDeployFee(action.payload)
      case TransactionType.DECLARE:
        return account.estimateDeclareFee(action.payload)
      case TransactionType.DEPLOY_ACCOUNT:
        return account.estimateAccountDeployFee(action.payload)
      default:
        assertNever(action)
        throw new ReviewError({ code: "INVALID_TRANSACTION_ACTION" })
    }
  }

  private getCallsFromTx(tx: InvokeTransaction) {
    let calls: Call[] = []
    if (tx.payload) {
      calls = ensureArray(tx.payload)
    }
    return calls
  }

  async getEnrichedFeeEstimation(
    txAction: TransactionAction,
    simulateAndReviewResult: SimulateAndReview,
  ): Promise<EstimatedFees> {
    const fee = getEstimatedFeeFromSimulationAndRespectWatermarkFee(
      simulateAndReviewResult,
    )

    await addEstimatedFee(fee, txAction)

    return fee
  }

  async simulateAndReview({
    transaction,
    accountDeployTransaction,
    feeTokenAddress,
    appDomain,
    maxSendEstimate,
  }: {
    transaction: TransactionAction
    feeTokenAddress: Address
    accountDeployTransaction?: AccountDeployTransaction
    appDomain?: string
    maxSendEstimate?: boolean
  }): Promise<EnrichedSimulateAndReview> {
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }
    const account = await this.wallet.getStarknetAccount(selectedAccount.id)

    // save some ms by starting the nonce check early
    const noncePromise = this.nonceManagementService.getNonce(
      selectedAccount.id,
    )

    const isDeploymentTransaction = Boolean(accountDeployTransaction)

    let isDelayedTransaction = false
    try {
      const multisig = await this.wallet.getMultisigAccount(selectedAccount.id)
      isDelayedTransaction =
        selectedAccount.type === "multisig" &&
        multisig &&
        multisig.threshold > 1
    } catch {
      // do nothing
    }

    try {
      if (
        !isArgentNetwork(selectedAccount?.network) || // If it's not an argent network we fallback to onchain fee estimation
        !this.isInvokeTransaction(transaction) // or if it's not an invoke transaction, because backend only supports invoke transactions
      ) {
        console.warn(
          `Falling back to onchain fee estimation as ${selectedAccount?.network.id} is not an argent network`,
        )
        return this.fallbackToOnchainFeeEstimation({
          account,
          transaction,
          isDeploymentTransaction,
          feeTokenAddress,
        })
      }

      const version = getTxVersionFromFeeToken(feeTokenAddress)

      const transactionNonce = isDeploymentTransaction
        ? "0x1"
        : await noncePromise

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

      const transactions = this.getPayloadFromInvokeTransaction({
        transaction,
        accountDeployTransaction,
        account,
        nonce: transactionNonce,
        version,
        chainId,
        appDomain,
      })

      const queryParams: Record<string, boolean> = {}

      if (isDelayedTransaction) {
        queryParams.delayedTransactions = true
      }

      if (maxSendEstimate) {
        queryParams.maxSendEstimate = true
      }

      const endpointWithParams = urlWithQuery(
        simulateAndReviewEndpoint,
        queryParams,
      )

      const result = await this.httpService.post<SimulateAndReview>(
        endpointWithParams,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactions }),
        },
        simulateAndReviewSchema,
      )

      // if there is a simulation error then there is also no actual simulation
      // or fee information, and no way to proceed with fee estimation
      // returning the result will surface the error to the user in the ui
      const hasSimulationError = result.transactions?.some((transaction) =>
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
        transaction,
        result,
      )
      return {
        ...result,
        enrichedFeeEstimation,
      }
    } catch (e) {
      console.error(e)
      return this.fallbackToOnchainFeeEstimation({
        transaction,
        account,
        isDeploymentTransaction,
        feeTokenAddress,
      })
    }
  }

  private getPayloadFromInvokeTransaction({
    transaction,
    accountDeployTransaction,
    account,
    nonce,
    version,
    chainId,
    appDomain,
  }: {
    transaction: InvokeTransaction
    accountDeployTransaction?: AccountDeployTransaction
    account: Account
    nonce: string
    version: string
    chainId: string
    appDomain?: string
  }) {
    const transactions: ApiTransaction[] = []

    if (accountDeployTransaction) {
      const { constructorCalldata, addressSalt, classHash } =
        accountDeployTransaction.payload
      transactions.push({
        type: TransactionType.DEPLOY_ACCOUNT,
        chainId,
        account: account.address,
        nonce: "0x0",
        version,
        cairoVersion: account.cairoVersion,
        calldata: constructorCalldata,
        salt: hexSchema.parse(addressSalt),
        classHash: hexSchema.parse(classHash),
        appDomain,
      })
    }

    const calls = ensureArray(transaction.payload)
    transactions.push({
      type: transaction.type,
      calls,
      account: account.address,
      nonce,
      version,
      chainId,
      cairoVersion: account.cairoVersion,
      appDomain,
      // appDomain: "https://starknetkit-blacked-listed.vercel.app", // to simulate blacklisted domain
    })

    return transactions
  }

  isInvokeTransaction(
    transaction: TransactionAction,
  ): transaction is InvokeTransaction {
    return transaction.type === TransactionType.INVOKE
  }

  async fallbackToOnchainFeeEstimation({
    transaction,
    account,
    isDeploymentTransaction,
    feeTokenAddress,
  }: {
    transaction: TransactionAction
    account: Account
    isDeploymentTransaction: boolean
    feeTokenAddress: Address
  }) {
    try {
      // Backend is failing we use the fallback method to estimate fees
      const enrichedFeeEstimation = await this.fetchFeesOnchain({
        starknetAccount: account,
        action: transaction,
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

  async buildInvokeTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    const transactions = ensureArray(calls)
    const account = await this.wallet.getAccount(baseAccount.id)

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const starknetAccount = await this.wallet.getStarknetAccount(account.id)

    const details = await this.buildTransactionDetails(
      account,
      { type: TransactionType.INVOKE, payload: transactions },
      estimatedFee,
      providedNonce,
    )

    if (!details) {
      return null
    }

    const { nonce, transactionFees, version } = details

    const tx = await starknetAccount.buildInvokeTransactionPayload(
      transactions,
      { nonce, version, ...transactionFees },
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
      const tx = await this.buildInvokeTransactionPayload(
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
    transaction: TransactionAction,
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ) {
    const fees = estimatedFee ?? (await getEstimatedFees(transaction))
    if (!fees) {
      return null
    }

    const version = getTxVersionFromFeeToken(fees.transactions.feeTokenAddress)

    const nonce = account.needsDeploy
      ? num.toHex(1)
      : providedNonce
        ? num.toHex(providedNonce)
        : await this.nonceManagementService.getNonce(account.id)

    const transactionFees = estimatedFeeToMaxResourceBounds(fees.transactions)

    const deploymentFees = fees.deployment
      ? estimatedFeeToMaxResourceBounds(fees.deployment)
      : undefined

    return {
      nonce,
      version,
      transactionFees,
      deploymentFees,
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
