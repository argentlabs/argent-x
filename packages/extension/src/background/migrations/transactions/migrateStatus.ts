import { transactionsRepo } from "../../../shared/transactions/store"

export const needsTxStatusMigration = async () => {
  const oldTransactions = await transactionsRepo.get()

  return oldTransactions.some(
    (transaction) =>
      // if old status is present
      "finalityStatus" in transaction ||
      "executionStatus" in transaction ||
      // OR if no status at all
      !transaction.status ||
      !("finality_status" in transaction.status),
  )
}

export const migrateTxStatus = async () => {
  const oldTransactions = await transactionsRepo.get()

  const updatedTransactions = oldTransactions.map((transaction) => {
    const tx = transaction
    if (!tx.status) {
      ;(tx.status as any) = {}
    }

    if ("finalityStatus" in transaction) {
      tx.status.finality_status = transaction.finalityStatus as any
      delete (tx as any).finalityStatus
    }
    if ("executionStatus" in transaction) {
      tx.status.execution_status = transaction.executionStatus as any
      delete (tx as any).executionStatus
    }

    if (!("finality_status" in transaction.status)) {
      tx.status.finality_status = "RECEIVED" // no status found on old tx, so we assume it was received. This will auto update to the correct status on next tx status update
    }

    return tx
  })

  await transactionsRepo.upsert(updatedTransactions)
}
