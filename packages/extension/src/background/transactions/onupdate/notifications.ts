import { FAILED_STATUS, SUCCESS_STATUSES } from "../../../shared/transactions"
import { decrementTransactionsBeforeReview } from "../../../shared/userReview"
import {
  addToAlreadyShown,
  hasShownNotification,
  sendTransactionNotification,
} from "../../notification"
import { TransactionUpdateListener } from "./type"

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, status, meta, account } = transaction
      if (
        (SUCCESS_STATUSES.includes(status) || FAILED_STATUS.includes(status)) &&
        !(await hasShownNotification(hash))
      ) {
        addToAlreadyShown(hash)

        if (!account.hidden && !meta?.isDeployAccount) {
          await decrementTransactionsBeforeReview()
          sendTransactionNotification(hash, status, meta)
        }
      }
    }
  }
