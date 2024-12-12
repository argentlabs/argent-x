import { getProvider } from "../../../shared/network"
import type { Transaction } from "../../../shared/transactions"
import {
  SUCCESS_STATUSES,
  getInFlightTransactions,
} from "../../../shared/transactions"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { getTransactionsStatusUpdate } from "../determineUpdates"

const TXN_HASH_NOT_FOUND_MSG = "Transaction hash not found"

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = getInFlightTransactions(transactions)

  // as this function tends to run into 429 errors, we'll simply keep the old status when it fails
  // TODO: we should add a cooldown when user run into 429 errors
  const fetchedTransactions = await Promise.allSettled(
    transactionsToCheck.map(async (transaction) => {
      const provider = getProvider(transaction.account.network)

      const txStatus = await provider.getTransactionStatus(transaction.hash)

      const { finality_status, execution_status } = txStatus

      // we do not want to return the transaction if it's rejected just yet,
      // as in some cases it is temporary, and don't want to show the user a false positive
      if (
        finality_status === "REJECTED" &&
        "revert_reason" in txStatus &&
        txStatus.revert_reason === TXN_HASH_NOT_FOUND_MSG
      ) {
        return transaction
      }

      // getTransactionStatus goes straight to the sequencer, hence it's much faster than the RPC nodes
      // because of that we need to wait for the RPC nodes to have a receipt as well
      try {
        if (
          execution_status === "REVERTED" ||
          SUCCESS_STATUSES.includes(finality_status)
        ) {
          const receipt = await provider.getTransactionReceipt(transaction.hash)

          if (
            receipt.isSuccess() &&
            (finality_status !== receipt.finality_status ||
              execution_status !== receipt.execution_status)
          ) {
            return transaction
          }

          if (receipt.isReverted()) {
            return {
              ...transaction,
              revertReason: receipt.revert_reason,
              status: {
                finality_status: finality_status,
                execution_status: execution_status,
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
          finality_status: finality_status,
          execution_status: execution_status,
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
