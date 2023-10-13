import { Transaction, compareTransactions } from "../../shared/transactions"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.filter(
    (newTransaction) =>
      oldTransactions.find((oldTransaction) =>
        compareTransactions(oldTransaction, newTransaction),
      )?.finalityStatus !== newTransaction.finalityStatus,
  )
}
