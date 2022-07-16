import { SUCCESS_STATUSES, Transaction } from "../../../shared/transactions"
import { resetStoredNonce } from "../../nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../../notification"

type TransactionUpdateListener = (updates: Transaction[]) => void

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, status, meta, account } = transaction
      if (
        (SUCCESS_STATUSES.includes(status) || status === "REJECTED") &&
        !(await hasShownNotification(hash))
      ) {
        addToAlreadyShown(hash)

        if (!account.hidden) {
          sentTransactionNotification(hash, status, meta)
        }
      }
      // on error remove stored (increased) nonce
      if (transaction.account && status === "REJECTED") {
        await resetStoredNonce(transaction.account)
      }
    }
  }
