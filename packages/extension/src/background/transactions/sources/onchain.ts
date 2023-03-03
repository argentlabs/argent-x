import { GetTransactionReceiptResponse, Sequencer, Status } from "starknet"

import { getProvider } from "../../../shared/network"
import {
  Transaction,
  getInFlightTransactions,
} from "../../../shared/transactions"
import { getTransactionsStatusUpdate } from "../determineUpdates"

const isFailedTransactionReceiptResponse = (
  receipt: GetTransactionReceiptResponse,
): receipt is Sequencer.FailedTransactionReceiptResponse => {
  if ("transaction_failure_reason" in receipt) {
    return true
  }
  return false
}

/** should never happen - in case the tx status is undefined */
const FALLBACK_STATUS: Status = "NOT_RECEIVED"

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = getInFlightTransactions(transactions)

  // as this function tends to run into 429 errors, we'll simply keep the old status when it fails
  // TODO: we should add a cooldown when user run into 429 errors
  const fetchedTransactions = await Promise.allSettled(
    transactionsToCheck.map(async (transaction): Promise<Transaction> => {
      const provider = getProvider(transaction.account.network)
      const receipt = await provider.getTransactionReceipt(transaction.hash)
      return {
        ...transaction,
        status: receipt.status || FALLBACK_STATUS,
        failureReason: isFailedTransactionReceiptResponse(receipt)
          ? receipt.transaction_failure_reason
          : undefined,
      }
    }),
  )

  const updatedTransactions = fetchedTransactions.reduce((acc, transaction) => {
    if (transaction.status === "fulfilled") {
      acc.push(transaction.value)
    }
    return acc
  }, [] as Transaction[])

  return getTransactionsStatusUpdate(transactions, updatedTransactions) // filter out transactions that have not changed
}
