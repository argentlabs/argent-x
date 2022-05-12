import { Transaction } from "../../shared/transactions"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.reduce((acc, settledPromise) => {
    if (
      settledPromise.status !==
      oldTransactions.find((t) => t.hash === settledPromise.hash)?.status //  the status has changed
    ) {
      acc.push(settledPromise)
      return acc
    }
    return acc
  }, [] as Transaction[])
}
