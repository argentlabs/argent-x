import { memoize } from "lodash-es"
import { useMemo } from "react"

import { transactionsStore } from "../../../shared/transactions/store"
import { useArrayStorage } from "../../hooks/useStorage"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { getAccountIdentifier } from "@argent/x-shared"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isUpgradeTransaction"

type UseAccountTransactions = (account?: BaseWalletAccount) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: Transaction) =>
    accountsEqual(transaction.account, account),
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

const useSortedTransactions = (account?: BaseWalletAccount) => {
  const transactions = useArrayStorage(
    transactionsStore,
    byAccountSelector(account),
  )

  const sortedTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  return { transactions, sortedTransactions }
}

export const useAccountTransactions: UseAccountTransactions = (account) => {
  const { transactions, sortedTransactions } = useSortedTransactions(account)

  const pendingTransactions = sortedTransactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return finality_status === "RECEIVED" && !transaction.meta?.isDeployAccount
  })

  return { transactions, pendingTransactions }
}

export const useDeployAccountTransactions: UseAccountTransactions = (
  account,
) => {
  const { transactions, sortedTransactions } = useSortedTransactions(account)

  const pendingTransactions = sortedTransactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return finality_status === "RECEIVED" && transaction.meta?.isDeployAccount
  })

  return { transactions, pendingTransactions }
}

export const useUpgradeAccountTransactions: UseAccountTransactions = (
  account,
) => {
  const { transactions, sortedTransactions } = useSortedTransactions(account)

  const pendingTransactions = sortedTransactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return (
      finality_status === "RECEIVED" && isSafeUpgradeTransaction(transaction)
    )
  })

  return { transactions, pendingTransactions }
}
