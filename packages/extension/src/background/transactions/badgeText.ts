import { memoize } from "lodash-es"

import {
  hideNotificationBadge,
  showNotificationBadge,
} from "../../shared/browser/badgeText"
import {
  MultisigPendingTransaction,
  multisigPendingTransactionsStore,
} from "../../shared/multisig/pendingTransactionsStore"
import { getMultisigAccountFromBaseWallet } from "../../shared/multisig/utils/baseMultisig"
import { Transaction } from "../../shared/transactions"
import {
  BaseWalletAccount,
  MultisigWalletAccount,
} from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { old_walletStore } from "../../shared/wallet/walletStore"
import { getTransactionStatus } from "../../shared/transactions/utils"

// selects transactions that are pending and match the provided account

export const pendingAccountTransactionsSelector = memoize(
  (account: BaseWalletAccount) => (transaction: Transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return (
      finality_status === "RECEIVED" &&
      !transaction.meta?.isDeployAccount &&
      accountsEqual(account, transaction.account)
    )
  },
)

export const multisigPendingTransactionSelector = memoize(
  (multisig: MultisigWalletAccount) =>
    (transaction: MultisigPendingTransaction) => {
      return accountsEqual(multisig, transaction.account) && transaction.notify
    },
)

// show count of pending transactions for current account

export const updateBadgeText = async () => {
  const selectedWalletAccount = await old_walletStore.get("selected")

  if (!selectedWalletAccount) {
    hideNotificationBadge()
    return
  }

  const multisig = await getMultisigAccountFromBaseWallet(selectedWalletAccount)

  if (!multisig) {
    hideNotificationBadge()
    return
  }

  let multisigTransactionsLength = 0
  const multisigTransactionSelector =
    multisigPendingTransactionSelector(multisig)

  multisigTransactionsLength = (
    await multisigPendingTransactionsStore.get(multisigTransactionSelector)
  ).length

  const badgeSize = multisigTransactionsLength

  if (badgeSize) {
    showNotificationBadge(badgeSize)
  } else {
    hideNotificationBadge()
  }
}

export const initBadgeText = () => {
  old_walletStore.subscribe("selected", () => {
    updateBadgeText()
  })

  multisigPendingTransactionsStore.subscribe(() => {
    updateBadgeText()
  })

  updateBadgeText()
}
