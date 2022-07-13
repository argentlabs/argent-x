import { Transaction } from "../../../shared/transactions"
import { resetStoredNonce } from "../../nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../../notification"

type TransactionUpdateListener = (updates: Transaction[]) => void

const successStatuses = ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"]

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, status, meta, account } = transaction
      if (
        (successStatuses.includes(status) || status === "REJECTED") &&
        !(await hasShownNotification(hash))
      ) {
        addToAlreadyShown(hash)

        if (!account.hidden) {
          sentTransactionNotification(hash, status, meta)
        }
      }
      // on error remove stored (increased) nonce
      if (transaction.account && status === "REJECTED") {
        resetStoredNonce(transaction.account)
      }
    }
  }
