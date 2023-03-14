import { memoize } from "lodash-es"
import { useMemo } from "react"

import { transactionsStore } from "../../../background/transactions/store"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  accountsEqual,
  getAccountIdentifier,
} from "../../../shared/wallet.service"

type UseAccountTransactions = (account?: BaseWalletAccount) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: Transaction) =>
    Boolean(account && accountsEqual(transaction.account, account)),
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export const useAccountTransactions: UseAccountTransactions = (account) => {
  const transactions = useArrayStorage(
    transactionsStore,
    byAccountSelector(account),
  )

  const sortedTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  const pendingTransactions = sortedTransactions.filter(
    ({ status, meta }) => status === "RECEIVED" && !meta?.isDeployAccount,
  )

  return { transactions, pendingTransactions }
}

export const useDeployAccountTransactions: UseAccountTransactions = (
  account,
) => {
  const transactions = useArrayStorage(
    transactionsStore,
    byAccountSelector(account),
  )

  const sortedTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  const pendingTransactions = sortedTransactions.filter(
    ({ status, meta }) => status === "RECEIVED" && meta?.isDeployAccount,
  )

  return { transactions, pendingTransactions }
}
