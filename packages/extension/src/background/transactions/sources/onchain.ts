import { getProvider } from "../../../shared/network"
import {
  Transaction,
  getInFlightTransactions,
  SUCCESS_STATUSES,
} from "../../../shared/transactions"
import { getTransactionsStatusUpdate } from "../determineUpdates"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = getInFlightTransactions(transactions)

  // as this function tends to run into 429 errors, we'll simply keep the old status when it fails
  // TODO: we should add a cooldown when user run into 429 errors
  const fetchedTransactions = await Promise.allSettled(
    transactionsToCheck.map(async (transaction) => {
      const provider = getProvider(transaction.account.network)
      const { finality_status, execution_status } =
        await provider.getTransactionStatus(transaction.hash)

      // getTransactionStatus goes straight to the sequencer, hence it's much faster than the RPC nodes
      // because of that we need to wait for the RPC nodes to have a receipt as well
      try {
        if (
          execution_status === "REVERTED" ||
          SUCCESS_STATUSES.includes(finality_status)
        ) {
          const receipt = await provider.getTransactionReceipt(transaction.hash)
          const {
            finality_status: receiptFinalityStatus,
            execution_status: receiptExecutionStatus,
          } = receipt

          if (
            finality_status !== receiptFinalityStatus ||
            execution_status !== receiptExecutionStatus
          ) {
            return transaction
          }

          if ("revert_reason" in receipt) {
            return {
              ...transaction,
              revertReason: receipt.revert_reason,
              status: {
                finality_status,
                execution_status,
              },
            }
          }
        }
      } catch (e) {
        console.warn(
          `Failed to fetch transaction receipt for ${transaction.hash}`,
          e,
        )
      }

      return {
        ...transaction,
        status: {
          finality_status,
          execution_status,
        },
      }
    }),
  )

  const updatedTransactions = fetchedTransactions.reduce<Transaction[]>(
    (acc, transaction) => {
      if (transaction.status === "fulfilled") {
        const { finality_status, execution_status } = getTransactionStatus(
          transaction.value,
        )
        acc.push({
          ...transaction.value,
          status: {
            finality_status: finality_status ?? "RECEIVED",
            execution_status,
          },
        })
      }
      return acc
    },
    [],
  )

  return getTransactionsStatusUpdate(transactions, updatedTransactions) // filter out transactions that have not changed
}
