import { sendMessageToUi } from "../activeTabs"
import { resetStoredNonce } from "../nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../notification"
import { TransactionUpdateListener } from "./transactions"

const successStatuses = ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"]

export const trackTransations: TransactionUpdateListener = async (
  transactions,
) => {
  if (transactions.length > 0) {
    sendMessageToUi({
      type: "TRANSACTION_UPDATES",
      data: transactions,
    })

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

        if (successStatuses.includes(status) && !account.hidden) {
          sendMessageToUi({ type: "TRANSACTION_SUCCESS", data: transaction })
        } else if (status === "REJECTED") {
          sendMessageToUi({
            type: "TRANSACTION_FAILURE",
            data: transaction,
          })
        }
      }
      // on error remove stored (increased) nonce
      if (transaction.account.address && status === "REJECTED") {
        resetStoredNonce(transaction.account)
      }
    }
  }
}
