import { Transaction } from "../../shared/transactions"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.filter((newTransaction) =>
    oldTransactions.some(
      (oldTransaction) =>
        oldTransaction.hash === newTransaction.hash &&
        oldTransaction.status !== newTransaction.status,
    ),
  )
}
