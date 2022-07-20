import browser from "webextension-polyfill"

import { Transaction } from "../../../shared/transactions"
import { resetStoredNonce } from "../../nonce"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../../notification"
import { SUCCESS_STATUSES, TRANSACTION_STATUSES_TO_TRACK } from "../constants"

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
        resetStoredNonce(transaction.account)
      }
    }
  }

export const showNotificationBadge = (allTransactions: Transaction[]) => {
  const shouldShowBadge = (tx: Transaction) =>
    TRANSACTION_STATUSES_TO_TRACK.includes(tx.status)

  const txnsToShowBadgeFor = allTransactions.filter(shouldShowBadge)

  browser.browserAction.setBadgeText({
    text: txnsToShowBadgeFor.length ? String(txnsToShowBadgeFor.length) : "",
  })

  browser.browserAction.setBadgeBackgroundColor({ color: "#29C5FF" })
}
