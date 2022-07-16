import { differenceWith } from "lodash-es"

import { ArrayStorage } from "../../shared/storage"
import {
  Transaction,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"
import {
  notifyAboutCompletedTransactions,
  showNotificationBadge,
} from "./onupdate/notifications"
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

  return transactionsStore.push(newTransaction)
}

const equalTransactionWithStatus = (
  a: Transaction,
  b: Transaction,
): boolean => {
  return compareTransactions(a, b) && a.status === b.status
}

transactionsStore.subscribe((allTransactions, changeSet) => {
  const updatedTransactions = differenceWith(
    changeSet.oldValue ?? [],
    changeSet.newValue ?? [],
    equalTransactionWithStatus,
  )

  // TODO: add badge to extension icon

  if (updatedTransactions.length > 0) {
    notifyAboutCompletedTransactions(updatedTransactions)
  }

  showNotificationBadge(allTransactions)
})
