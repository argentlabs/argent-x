import type {
  EnrichedSimulateAndReviewV2,
  EstimatedFeesV2,
} from "@argent/x-shared/simulation"
import type {
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
    appDomain,
    maxSendEstimate,
  }: {
    transaction: TransactionAction
    accountDeployTransaction?: AccountDeployTransaction
    appDomain?: string
    maxSendEstimate?: boolean
  }): Promise<EnrichedSimulateAndReviewV2>

  getCompressedTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFeesV2,
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
