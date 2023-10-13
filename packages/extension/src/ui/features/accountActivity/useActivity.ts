import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"
import { TransactionMeta } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { formatDate } from "../../services/dates"
import { useAccountTransactions } from "../accounts/accountTransactions.state"

export interface ActivityTransaction {
  hash: string
  date: string
  meta?: TransactionMeta
  isRejected?: boolean
  isCancelled?: boolean
  timestamp?: number
}

export type DailyActivity = Record<string, ActivityTransaction[]>

export function useActivity(account: BaseWalletAccount): DailyActivity {
  const { transactions } = useAccountTransactions(account)
  const activity: DailyActivity = {}
  for (const {
    hash,
    timestamp,
    meta,
    finalityStatus,
    executionStatus,
  } of transactions) {
    // RECEIVED transactions are already shown as pending
    if (
      finalityStatus !== TransactionFinalityStatus.RECEIVED ||
      executionStatus === TransactionExecutionStatus.REJECTED
    ) {
      const date = new Date(timestamp * 1000).toISOString()
      const dateLabel = formatDate(date)
      const isRejected = executionStatus === "REJECTED"
      const isCancelled = finalityStatus === "CANCELLED"
      activity[dateLabel] ||= []
      activity[dateLabel].push({
        hash,
        date,
        meta,
        isRejected,
        isCancelled,
      })
    }
  }
  return activity
}
