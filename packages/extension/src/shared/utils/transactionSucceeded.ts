import type { Transaction } from "../transactions"
import { getTransactionStatus } from "../transactions/utils"

export const hasSuccessfulTransaction = (
  newTxs: Transaction[],
  oldTxs?: Transaction[],
) => {
  const successfulTransactions = getSuccessfulTransactions(newTxs, oldTxs)
  return Boolean(successfulTransactions.length)
}

export const getSuccessfulTransactions = (
  newTxs: Transaction[],
  oldTxs: Transaction[] | undefined | null,
) => {
  const successfulTransactions = []
  for (const newTransaction of newTxs) {
    const oldTransaction = oldTxs?.find(
      (oldTransaction) => oldTransaction.hash === newTransaction.hash,
    )

    if (!oldTransaction) {
      return successfulTransactions
    }

    const { finality_status: oldFinalityStatus } =
      getTransactionStatus(oldTransaction)
    const { finality_status: newFinalityStatus } =
      getTransactionStatus(newTransaction)

    const oldTransactionStatus =
      oldFinalityStatus || (oldTransaction as any).finalityStatus // backwards compatible

    if (
      oldTransactionStatus === "RECEIVED" &&
      newFinalityStatus &&
      ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"].includes(newFinalityStatus)
    ) {
      successfulTransactions.push(newTransaction)
    }
  }

  return successfulTransactions
}
