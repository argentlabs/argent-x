import { Status } from "starknet"

import { getProvider } from "../../shared/networks"
import { Transaction } from "../../shared/transactions"
import { getTransactionsStatusUpdate } from "./determineUpdates"

const transactionStatusToCheck: Status[] = ["RECEIVED", "NOT_RECEIVED"]

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = transactions.filter(({ status }) =>
    transactionStatusToCheck.includes(status),
  )

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
