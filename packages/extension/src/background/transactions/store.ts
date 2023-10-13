import { differenceWith } from "lodash-es"

import { ArrayStorage } from "../../shared/storage"
import { StorageChange } from "../../shared/storage/types"
import {
  ExtendedTransactionStatus,
  Transaction,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"
import { runAddedOrUpdatedHandlers, runChangedStatusHandlers } from "./onupdate"
import { checkTransactionHash } from "./checkTransactionHash"
import { adaptArrayStorage } from "../../shared/storage/__new/repository"
import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"
import { IRepository } from "../../shared/storage/__new/interface"

/**
 * @deprecated use `transactionsRepo` instead
 */
export const transactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:transactions",
  areaName: "local",
  compare: compareTransactions,
})

export const transactionsRepo: IRepository<Transaction> =
  adaptArrayStorage(transactionsStore)

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export const addTransaction = (
  transaction: TransactionRequest,
  finalityStatus?: ExtendedTransactionStatus,
  executionStatus?: TransactionExecutionStatus,
) => {
  // sanity checks
  if (!checkTransactionHash(transaction.hash)) {
    return // dont throw
  }

  const defaultStatus: ExtendedTransactionStatus =
    TransactionFinalityStatus.RECEIVED

  const newTransaction: Transaction = {
    finalityStatus: finalityStatus ?? defaultStatus,
    executionStatus,
    timestamp: timestampInSeconds(),
    ...transaction,
  }

  return transactionsStore.push(newTransaction)
}

export const getUpdatedTransactionsForChangeSet = (
  changeSet: StorageChange<Transaction[]>,
) => {
  const updatedTransactions = differenceWith(
    changeSet.oldValue ?? [],
    changeSet.newValue ?? [],
    equalTransactionWithStatus,
  )
  return updatedTransactions
}

const equalTransactionWithStatus = (
  a: Transaction,
  b: Transaction,
): boolean => {
  return (
    compareTransactions(a, b) &&
    a.finalityStatus === b.finalityStatus &&
    a.executionStatus === b.executionStatus
  )
}

transactionsStore.subscribe((_, changeSet) => {
  /** note this includes where all transactions are initially loaded in the store */
  const addedOrUpdatedTransactions = differenceWith(
    changeSet.newValue ?? [],
    changeSet.oldValue ?? [],
    equalTransactionWithStatus,
  )

  /** transactions which already existed in the store, and have now changed status */
  const changedStatusTransactions = changeSet.newValue?.flatMap(
    (newTransaction) => {
      const oldTransaction = changeSet.oldValue?.find(
        (oldTransaction) => oldTransaction.hash === newTransaction.hash,
      )
      if (
        oldTransaction &&
        (oldTransaction.finalityStatus !== newTransaction.finalityStatus ||
          oldTransaction.executionStatus !== newTransaction.executionStatus)
      ) {
        return newTransaction
      }
      return []
    },
  )

  if (addedOrUpdatedTransactions.length > 0) {
    runAddedOrUpdatedHandlers(addedOrUpdatedTransactions)
  }

  if (changedStatusTransactions && changedStatusTransactions.length > 0) {
    runChangedStatusHandlers(changedStatusTransactions)
  }
})
