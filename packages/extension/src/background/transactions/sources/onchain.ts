import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"
import { getProvider } from "../../../shared/network"
import {
  Transaction,
  getInFlightTransactions,
} from "../../../shared/transactions"
import { getTransactionsStatusUpdate } from "../determineUpdates"

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = getInFlightTransactions(transactions)

  // as this function tends to run into 429 errors, we'll simply keep the old status when it fails
  // TODO: we should add a cooldown when user run into 429 errors
  const fetchedTransactions = await Promise.allSettled(
    transactionsToCheck.map(async (transaction) => {
      const provider = getProvider(transaction.account.network)
      const { finality_status, execution_status } =
        await provider.getTransactionStatus(transaction.hash)

      const isFailed =
        execution_status === "REVERTED" || finality_status === "REJECTED"
      if (!isFailed) {
        return {
          ...transaction,
          finalityStatus: finality_status as TransactionFinalityStatus,
          executionStatus: execution_status as TransactionExecutionStatus,
        }
      }

      const tx = await provider.getTransactionReceipt(transaction.hash)

      // Handle Reverted transaction
      if ("revert_reason" in tx) {
        const finalityStatus =
          (tx.finality_status as TransactionFinalityStatus) ||
          "status" in tx ||
          TransactionFinalityStatus.NOT_RECEIVED // For backward compatibility on mainnet

        return {
          ...transaction,
          finalityStatus,
          revertReason: tx.revert_reason,
        }

        // Handle Rejected transaction
      } else if ("transaction_failure_reason" in tx) {
        const anyTx = tx as any
        return {
          ...transaction,
          finalityStatus: anyTx.status ?? TransactionFinalityStatus.RECEIVED,
          executionStatus: TransactionExecutionStatus.REJECTED,
          failureReason: anyTx.transaction_failure_reason,
        }
      }

      return transaction
    }),
  )

  const updatedTransactions = fetchedTransactions.reduce<Transaction[]>(
    (acc, transaction) => {
      if (transaction.status === "fulfilled") {
        acc.push({
          ...transaction.value,
          finalityStatus:
            transaction.value.finalityStatus ??
            TransactionFinalityStatus.RECEIVED,
          executionStatus: transaction.value.executionStatus,
        })
      }
      return acc
    },
    [],
  )

  return getTransactionsStatusUpdate(transactions, updatedTransactions) // filter out transactions that have not changed
}
