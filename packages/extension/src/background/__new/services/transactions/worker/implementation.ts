import { differenceWith } from "lodash-es"

import type { ArrayStorage } from "../../../../../shared/storage"
import type { Transaction } from "../../../../../shared/transactions"
import {
  runAddedOrUpdatedHandlers,
  runChangedStatusHandlers,
} from "../../../../transactions/onupdate"
import { equalTransactionWithStatus } from "../../../../../shared/transactions/store"
import { getTransactionStatus } from "../../../../../shared/transactions/utils"

export class TransactionsWorker {
  constructor(private readonly transactionsStore: ArrayStorage<Transaction>) {
    this.transactionsStore.subscribe((_, changeSet) => {
      /** note this includes where all transactions are initially loaded in the store */
      const addedOrUpdatedTransactions = differenceWith(
        changeSet.newValue ?? [],
        changeSet.oldValue ?? [],
        equalTransactionWithStatus,
      )

      /** transactions which already existed in the store, and have now changed status */
      const changedStatusTransactions = changeSet.newValue?.flatMap(
        (newTransaction) => {
          const {
            finality_status: newFinalityStatus,
            execution_status: newExecutionStatus,
          } = getTransactionStatus(newTransaction)
          const oldTransaction = changeSet.oldValue
            ?.map((oldTx) => {
              const {
                finality_status: oldFinalityStatus,
                execution_status: oldExecutionStatus,
              } = getTransactionStatus(oldTx)

              return {
                ...oldTx,
                status: {
                  finality_status: oldFinalityStatus,
                  execution_status: oldExecutionStatus,
                },
              }
            })
            .find(
              (oldTransaction) => oldTransaction.hash === newTransaction.hash,
            )
          if (
            oldTransaction &&
            (oldTransaction.status.finality_status !== newFinalityStatus ||
              oldTransaction.status.execution_status !== newExecutionStatus)
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
  }
}
