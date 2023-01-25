import { memoize } from "lodash-es"

import {
  hideNotificationBadge,
  showNotificationBadge,
} from "../../shared/browser/badgeText"
import { Transaction } from "../../shared/transactions"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { walletStore } from "../../shared/wallet/walletStore"
import { transactionsStore } from "./store"

// selects transactions that are pending and match the provided account

export const pendingAccountTransactionsSelector = memoize(
  (account: BaseWalletAccount) => (transaction: Transaction) =>
    transaction.status === "RECEIVED" &&
    !transaction.meta?.isDeployAccount &&
    accountsEqual(account, transaction.account),
)

// show count of pending transactions for current account

export const updateBadgeText = async () => {
  const selectedWalletAccount = await walletStore.get("selected")
  if (!selectedWalletAccount) {
    hideNotificationBadge()
    return
  }
  const selector = pendingAccountTransactionsSelector(selectedWalletAccount)
  const pendingAccountTransactions = await transactionsStore.get(selector)
  if (pendingAccountTransactions.length) {
    showNotificationBadge(pendingAccountTransactions.length)
  } else {
    hideNotificationBadge()
  }
}

export const initBadgeText = () => {
  walletStore.subscribe("selected", () => {
    updateBadgeText()
  })

  transactionsStore.subscribe(() => {
    updateBadgeText()
  })

  updateBadgeText()
}
