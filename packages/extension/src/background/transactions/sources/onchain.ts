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
      const status = await provider.getTransactionStatus(transaction.hash)
      return {
        ...transaction,
        status: status.tx_status,
        failureReason: status.tx_failure_reason,
      }
    }),
  )

  const updatedTransactions = fetchedTransactions.reduce<Transaction[]>(
    (acc, transaction) => {
      if (transaction.status === "fulfilled") {
        acc.push(transaction.value)
      }
      return acc
    },
    [],
  )

  return getTransactionsStatusUpdate(transactions, updatedTransactions) // filter out transactions that have not changed
}
