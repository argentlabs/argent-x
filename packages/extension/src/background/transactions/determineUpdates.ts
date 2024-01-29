import { Transaction, compareTransactions } from "../../shared/transactions"
import { getTransactionStatus } from "../../shared/transactions/utils"

export function getTransactionsStatusUpdate(
  oldTransactions: Transaction[],
  newTransactions: Transaction[],
): Transaction[] {
  return newTransactions.filter((newTransaction) => {
    const oldTransaction = oldTransactions.find((oldTransaction) =>
      compareTransactions(oldTransaction, newTransaction),
    )

    const {
      finality_status: oldFinalityStatus,
      execution_status: oldExecutionStatus,
    } = getTransactionStatus(oldTransaction)
    const {
      finality_status: newFinalityStatus,
      execution_status: newExecutionStatus,
    } = getTransactionStatus(newTransaction)

    return (
      !oldTransaction ||
      oldFinalityStatus !== newFinalityStatus ||
      oldExecutionStatus !== newExecutionStatus
    )
  })
}
