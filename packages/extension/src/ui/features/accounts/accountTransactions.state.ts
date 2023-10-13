import { memoize } from "lodash-es"
import { useMemo } from "react"

import { transactionsStore } from "../../../background/transactions/store"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"
import { getAccountIdentifier } from "@argent/shared"

type UseAccountTransactions = (account?: BaseWalletAccount) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: Transaction) =>
    accountsEqual(transaction.account, account),
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
    ({ finalityStatus, meta, executionStatus }) =>
      finalityStatus === TransactionFinalityStatus.RECEIVED &&
      executionStatus !== TransactionExecutionStatus.REJECTED && // Rejected transactions have finality status RECEIVED
      !meta?.isDeployAccount,
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
    ({ finalityStatus, executionStatus, meta }) =>
      finalityStatus === TransactionFinalityStatus.RECEIVED &&
      executionStatus !== TransactionExecutionStatus.REJECTED && // Rejected transactions have finality status RECEIVED
      meta?.isDeployAccount,
  )

  return { transactions, pendingTransactions }
}

export const useUpgradeAccountTransactions: UseAccountTransactions = (
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
    ({ finalityStatus, executionStatus, meta }) =>
      finalityStatus === TransactionFinalityStatus.RECEIVED &&
      executionStatus !== TransactionExecutionStatus.REJECTED && // Rejected transactions have finality status RECEIVED
      meta?.isUpgrade,
  )

  return { transactions, pendingTransactions }
}
