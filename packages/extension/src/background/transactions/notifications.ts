import { IS_BROWSER } from "starknet/dist/constants"
import { browserAction } from "webextension-polyfill"
import { sendMessageToUi } from "../activeTabs"
import { resetStoredNonce } from "../nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../notification"
import { TransactionUpdateListener } from "./transactions"

const successStatuses = ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"]

export const trackTransactions: TransactionUpdateListener = async (
  newTransactions,
  allTransactions,
) => {
  if (newTransactions.length > 0) {
    sendMessageToUi({
      type: "TRANSACTION_UPDATES",
      data: newTransactions,
    })

    for (const transaction of newTransactions) {
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
      if (transaction.account && status === "REJECTED") {
        resetStoredNonce(transaction.account)
      }
    }
  }

  if (IS_BROWSER) {
    const pendingTransactions = [...newTransactions, ...allTransactions].filter(
      (tx) => !successStatuses.includes(tx.status),
    )

    browserAction.setBadgeText({
      text: pendingTransactions.length
        ? String(pendingTransactions.length)
        : "",
    })

    browserAction.setBadgeBackgroundColor({ color: "#29C5FF" })
  }
}
