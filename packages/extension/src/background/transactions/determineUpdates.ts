import { Transaction } from "../../shared/transactions"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.filter(
    (newTransaction) =>
      oldTransactions.find(
        (oldTransaction) => oldTransaction.hash === newTransaction.hash,
      )?.status !== newTransaction.status,
  )
}
