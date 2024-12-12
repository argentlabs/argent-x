import type { ExtendedTransactionStatus } from "../../../transactions"

export type ActivityTransactionFailureReason =
  | "REVERTED"
  | "REJECTED"
  | "CANCELLED"

export function getTransactionFailureReason({
  finality_status,
  execution_status,
}: ExtendedTransactionStatus): ActivityTransactionFailureReason | undefined {
  // Cancellation happens before submitting by backend
  // Rejection happens when validation fails onchain
  // Reversion happens when transaction execution fails onchain
  switch (finality_status) {
    case "CANCELLED":
    case "REJECTED":
      return finality_status
    default:
      if (execution_status === "REVERTED") {
        return execution_status
      }
      return undefined
  }
}
