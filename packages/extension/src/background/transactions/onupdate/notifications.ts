import { decrementTransactionsBeforeReview } from "../../../shared/misc"
import { SUCCESS_STATUSES } from "../../../shared/transactions"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../../notification"
import { TransactionUpdateListener } from "./type"

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, status, meta, account } = transaction
      if (
        (SUCCESS_STATUSES.includes(status) || status === "REJECTED") &&
        !(await hasShownNotification(hash))
      ) {
        addToAlreadyShown(hash)

        await decrementTransactionsBeforeReview()

        if (!account.hidden) {
          sentTransactionNotification(hash, status, meta)
        }
      }
    }
  }
