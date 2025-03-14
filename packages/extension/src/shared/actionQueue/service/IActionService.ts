import type { SimulateAndReview } from "@argent/x-shared/simulation"
import type { MessageType } from "../../messages/types"
import type { ActionHash, ActionItemExtra } from "../schema"

/** Extract the 'data' type of each item in the union if it exists */
type ExtractDataType<Type> = Type extends { data?: any } ? Type["data"] : never

/** A union of the 'data' part of each MessageType */
type MessageDataType = ExtractDataType<MessageType>

export type ApproveActionInput = {
  actionHash: ActionHash
  extra?: ActionItemExtra
}

export interface IActionService {
  approve(approveActionInput: ApproveActionInput): Promise<void>
  approveAndWait(
    approveActionInput: ApproveActionInput,
  ): Promise<MessageDataType | undefined>
  reject(actionHash: ActionHash | ActionHash[]): Promise<void>
  rejectAll(): Promise<void>
  updateTransactionReview({
    actionHash,
    transactionReview,
  }: {
    actionHash: ActionHash
    transactionReview: SimulateAndReview
  }): Promise<void>
  clearActionError(actionHash: ActionHash): Promise<void>
}
