import { FAILED_STATUS, SUCCESS_STATUSES } from "../../../shared/transactions"
import { decrementTransactionsBeforeReview } from "../../../shared/userReview"
import {
  addToAlreadyShown,
  hasShownNotification,
  sendTransactionNotification,
} from "../../../shared/notification"
import { TransactionUpdateListener } from "./type"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, meta, account } = transaction
      const { finality_status, execution_status } =
        getTransactionStatus(transaction)
      if (
        ((finality_status && SUCCESS_STATUSES.includes(finality_status)) ||
          (execution_status && FAILED_STATUS.includes(execution_status))) &&
        !(await hasShownNotification(hash))
      ) {
        void addToAlreadyShown(hash)

        if (!account.hidden && !meta?.isDeployAccount) {
          await decrementTransactionsBeforeReview()
          finality_status &&
            sendTransactionNotification(
              hash,
              { execution_status, finality_status },
              meta,
            )
        }
      }
    }
  }
