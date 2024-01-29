import { TransactionMeta } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { formatDate } from "../../services/dates"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import {
  ActivityTransactionFailureReason,
  getTransactionFailureReason,
} from "./getTransactionFailureReason"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export interface ActivityTransaction {
  hash: string
  date: string
  meta?: TransactionMeta
  failureReason?: ActivityTransactionFailureReason
  timestamp?: number
}

export type DailyActivity = Record<string, ActivityTransaction[]>

export function useActivity(account: BaseWalletAccount): DailyActivity {
  const { transactions } = useAccountTransactions(account)
  const activity: DailyActivity = {}
  for (const transaction of transactions) {
    // RECEIVED transactions are already shown as pending
    const { timestamp, hash, meta } = transaction
    const { finality_status, execution_status } =
      getTransactionStatus(transaction)

    if (finality_status !== "RECEIVED") {
      const date = new Date(timestamp * 1000).toISOString()
      const dateLabel = formatDate(date)
      const failureReason = getTransactionFailureReason({
        finality_status,
        execution_status,
      })

      activity[dateLabel] ||= []
      activity[dateLabel].push({
        hash,
        date,
        meta,
        failureReason,
      })
    }
  }
  return activity
}
