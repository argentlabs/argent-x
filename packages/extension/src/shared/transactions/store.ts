import { differenceWith } from "lodash-es"

import { ArrayStorage } from "../storage"
import { StorageChange } from "../storage/types"
import {
  Transaction,
  TransactionRequest,
  ExtendedTransactionStatus,
  compareTransactions,
} from "../transactions"
import { adaptArrayStorage } from "../storage/__new/repository"
import { IRepository } from "../storage/__new/interface"
import { checkTransactionHash, getTransactionStatus } from "./utils"

/**
 * @deprecated use `transactionsRepo` instead
 */
export const transactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:transactions",
  areaName: "local",
  compare: compareTransactions,
})

export type ITransactionsRepository = IRepository<Transaction>

export const transactionsRepo: ITransactionsRepository =
  adaptArrayStorage(transactionsStore)

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export const addTransaction = (
  transaction: TransactionRequest,
  status?: ExtendedTransactionStatus,
) => {
  // sanity checks
  if (!checkTransactionHash(transaction.hash)) {
    return // dont throw
  }

  const defaultStatus: ExtendedTransactionStatus = {
    finality_status: "RECEIVED",
  }

  const newTransaction: Transaction = {
    status: status ?? defaultStatus,
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

export const equalTransactionWithStatus = (
  a: Transaction,
  b: Transaction,
): boolean => {
  const {
    finality_status: aFinalityStatus,
    execution_status: aExecutionStatus,
  } = getTransactionStatus(a)
  const {
    finality_status: bFinalityStatus,
    execution_status: bExecutionStatus,
  } = getTransactionStatus(b)

  return (
    compareTransactions(a, b) &&
    aFinalityStatus === bFinalityStatus &&
    aExecutionStatus === bExecutionStatus
  )
}
