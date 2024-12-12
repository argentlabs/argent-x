import type { Transaction } from "../transactions"
import { getTransactionStatus } from "./utils"
import type { StorageChange } from "../storage/__new/interface"

export function getChangedStatusTransactions(
  changeSet: StorageChange<Transaction[]>,
) {
  return changeSet.newValue?.flatMap((newTransaction) => {
    const {
      finality_status: newFinalityStatus,
      execution_status: newExecutionStatus,
    } = getTransactionStatus(newTransaction)
    const oldTransaction = changeSet.oldValue
      ?.map((oldTx) => {
        const {
          finality_status: oldFinalityStatus,
          execution_status: oldExecutionStatus,
        } = getTransactionStatus(oldTx)

        return {
          ...oldTx,
          status: {
            finality_status: oldFinalityStatus,
            execution_status: oldExecutionStatus,
          },
        }
      })
      .find((oldTransaction) => oldTransaction.hash === newTransaction.hash)
    if (
      oldTransaction &&
      (oldTransaction.status.finality_status !== newFinalityStatus ||
        oldTransaction.status.execution_status !== newExecutionStatus)
    ) {
      return newTransaction
    }
    return []
  })
}
