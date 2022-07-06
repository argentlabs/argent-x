import { Transaction } from "../../shared/transactions"
import { compareTransactions } from "./store"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.filter(
    (newTransaction) =>
      oldTransactions.find((oldTransaction) =>
        compareTransactions(oldTransaction, newTransaction),
      )?.status !== newTransaction.status,
  )
}
