import { TransactionMeta } from "../../../shared/transactions"
import { ActivityTransactionFailureReason } from "./getTransactionFailureReason"

export interface ActivityTransaction {
  hash: string
  date: string
  meta?: TransactionMeta
  failureReason?: ActivityTransactionFailureReason
  timestamp?: number
}

export type DailyActivity = Record<string, ActivityTransaction[]>
