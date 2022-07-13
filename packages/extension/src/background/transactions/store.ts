import { differenceWith } from "lodash-es"

import { ArrayStorage } from "../../shared/storage"
import {
  Transaction,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"
import { notifyAboutCompletedTransactions } from "./onupdate/notifications"
import { checkTransactionHash } from "./transactionExecution"

export const transactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:transactions",
  areaName: "local",
  compare: compareTransactions,
})

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export const addTransaction = async (transaction: TransactionRequest) => {
  // sanity checks
  if (!checkTransactionHash(transaction.hash)) {
    return // dont throw
  }

  const newTransaction = {
    status: "RECEIVED" as const,
    timestamp: timestampInSeconds(),
    ...transaction,
  }

  return transactionsStore.add(newTransaction)
}

const equalTransactionWithStatus = (
  a: Transaction,
  b: Transaction,
): boolean => {
  return compareTransactions(a, b) && a.status === b.status
}

transactionsStore.subscribe((_, changeSet) => {
  const updatedTransactions = differenceWith(
    changeSet.oldValue ?? [],
    changeSet.newValue ?? [],
    equalTransactionWithStatus,
  )
  if (updatedTransactions.length > 0) {
    console.log(
      "transactionsStore updated",
      updatedTransactions.length,
      updatedTransactions,
    )
    notifyAboutCompletedTransactions(updatedTransactions)
  }
})
