import { Transaction } from "../../../../transactions"
import { ActivityTransaction } from "../type"

/**
 * Return an array of calls from transaction
 */

export const getCallsFromTransaction = (
  transaction: ActivityTransaction | Transaction,
) => {
  const transactions = transaction.meta?.transactions
  if (transactions) {
    const calls = Array.isArray(transactions) ? transactions : [transactions]
    return calls.filter(Boolean)
  }
  return []
}
