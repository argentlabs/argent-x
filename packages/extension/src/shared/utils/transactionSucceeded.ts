import { TransactionFinalityStatus } from "starknet"
import { Transaction } from "../transactions"

export const transactionSucceeded = (
  newTxs: Transaction[],
  oldTxs?: Transaction[],
): boolean => {
  for (const newTransaction of newTxs) {
    const oldTransaction = oldTxs?.find(
      (oldTransaction) => oldTransaction.hash === newTransaction.hash,
    )
    if (
      oldTransaction &&
      oldTransaction.finalityStatus === TransactionFinalityStatus.RECEIVED &&
      ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"].includes(
        newTransaction.finalityStatus,
      )
    ) {
      return true
    }
  }

  return false
}
