import { FAILED_STATUS, SUCCESS_STATUSES } from "../../../shared/transactions"
import { decrementTransactionsBeforeReview } from "../../../shared/userReview"
import {
  addToAlreadyShown,
  hasShownNotification,
  sendTransactionNotification,
} from "../../../shared/notification"
import { TransactionUpdateListener } from "./type"

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, finalityStatus, executionStatus, meta, account } =
        transaction
      if (
        (SUCCESS_STATUSES.includes(finalityStatus) ||
          (executionStatus && FAILED_STATUS.includes(executionStatus))) &&
        !(await hasShownNotification(hash))
      ) {
        void addToAlreadyShown(hash)

        if (!account.hidden && !meta?.isDeployAccount) {
          await decrementTransactionsBeforeReview()
          finalityStatus &&
            sendTransactionNotification(hash, finalityStatus, meta)
        }
      }
    }
  }
