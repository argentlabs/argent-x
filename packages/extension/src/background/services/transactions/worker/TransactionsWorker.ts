import { differenceWith } from "lodash-es"

import type { ArrayStorage } from "../../../../shared/storage"
import type { Transaction } from "../../../../shared/transactions"
import { runAddedOrUpdatedHandlers } from "../../../transactions/onupdate"
import { equalTransactionWithStatus } from "../../../../shared/transactions/store"

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
      if (addedOrUpdatedTransactions.length > 0) {
        void runAddedOrUpdatedHandlers(addedOrUpdatedTransactions)
      }
    })
  }
}
