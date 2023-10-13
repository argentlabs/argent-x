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
      const tx = await provider.getTransactionReceipt(transaction.hash)

      let updatedTransaction: Transaction

      // Handle Reverted transaction
      if ("revert_reason" in tx) {
        updatedTransaction = {
          ...transaction,
          finalityStatus:
            tx.finality_status ||
            tx.status ||
            TransactionFinalityStatus.NOT_RECEIVED, // For backward compatibility on mainnet
          revertReason: tx.revert_reason,
        }

        // Handle Rejected transaction
      } else if ("transaction_failure_reason" in tx) {
        updatedTransaction = {
          ...transaction,
          finalityStatus: tx.status ?? TransactionFinalityStatus.RECEIVED,
          executionStatus: TransactionExecutionStatus.REJECTED,
          failureReason: tx.transaction_failure_reason,
        }
      } else {
        // Handle successful transaction
        updatedTransaction = {
          ...transaction,
          finalityStatus: tx.finality_status || tx.status, // For backward compatibility on mainnet
          executionStatus: tx.execution_status,
        }
      }

      return updatedTransaction
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
