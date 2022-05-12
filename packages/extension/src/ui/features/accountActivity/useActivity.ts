import { TransactionMeta } from "../../../shared/transactions"
import { formatDate } from "../../services/dates"
import { useAccountTransactions } from "../accounts/accountTransactions.state"

export interface ActivityTransaction {
  hash: string
  date: Date
  meta?: TransactionMeta
}

export type DailyActivity = Record<string, ActivityTransaction[]>

export function useActivity(address: string): DailyActivity {
  const { transactions } = useAccountTransactions(address)
  const activity: DailyActivity = {}
  for (const { hash, timestamp, meta, status } of transactions) {
    // RECEIVED transactions are already shown as pending
    if (status !== "RECEIVED") {
      const date = new Date(timestamp * 1000)
      const dateLabel = formatDate(date)
      activity[dateLabel] ||= []
      activity[dateLabel].push({ hash, date, meta })
    }
  }
  return activity
}
