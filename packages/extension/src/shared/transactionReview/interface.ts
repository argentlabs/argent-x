import type {
  EnrichedSimulateAndReview,
  EstimatedFees,
} from "@argent/x-shared/simulation"
import type {
  Address,
  ITransactionReviewBase,
  ITransactionReviewLabel,
  ITransactionReviewWarning,
  TransactionAction,
} from "@argent/x-shared"
import type { BaseWalletAccount } from "../wallet.model"
import type { BigNumberish, Call } from "starknet"
import type { AccountDeployTransaction } from "./transactionAction.model"

export interface ITransactionReviewService extends ITransactionReviewBase {
  simulateAndReview({
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
  }): Promise<EnrichedSimulateAndReview>

  getCompressedTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ): Promise<string | null>
}

export type ITransactionReviewLabelsStore = {
  labels?: ITransactionReviewLabel[]
  updatedAt?: number
}

export type ITransactionReviewWarningsStore = {
  warnings?: ITransactionReviewWarning[]
  updatedAt?: number
}
