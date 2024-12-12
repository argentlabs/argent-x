import type { TxHash } from "@argent/x-shared"

export interface BaseTransaction {
  hash: TxHash
  networkId: string
}

export type TransactionStatus =
  | {
      status: "pending" | "confirmed"
    }
  | {
      status: "failed"
      reason: Error
    }

export interface TransactionWithStatus extends BaseTransaction {
  status: TransactionStatus
}
