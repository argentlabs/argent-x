import { SUCCESS_STATUSES } from "../../../shared/transactions"
import { decrementTransactionsBeforeReview } from "../../../shared/userReview"
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

        if (!account.hidden && !meta?.isDeployAccount) {
          await decrementTransactionsBeforeReview()
          sentTransactionNotification(hash, status, meta)
        }
      }
    }
  }
