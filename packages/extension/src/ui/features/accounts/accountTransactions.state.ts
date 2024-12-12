import { isEmpty } from "lodash-es"
import { useMemo } from "react"

import type { Transaction } from "../../../shared/transactions"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isSafeUpgradeTransaction"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import { accountTransactionsView } from "../../views/transactions"
import { useMultisigPendingUpgradeTransactions } from "../multisig/multisigTransactions.state"

type UseAccountTransactions = (account?: BaseWalletAccount) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const useSortedTransactions = (account?: BaseWalletAccount) => {
  const transactions = useView(accountTransactionsView(account))

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp - a.timestamp),
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

export const useHasPendingUpgradeAccountTransactions = (
  account?: WalletAccount,
) => {
  const { sortedTransactions } = useSortedTransactions(account)

  const pendingMultisigTransactions =
    useMultisigPendingUpgradeTransactions(account)

  const pendingTransactions = useMemo(() => {
    const transactions = sortedTransactions.filter((transaction) => {
      const { finality_status } = getTransactionStatus(transaction)

      return (
        finality_status === "RECEIVED" && isSafeUpgradeTransaction(transaction)
      )
    })

    return transactions
  }, [sortedTransactions])

  return !isEmpty(pendingTransactions) || !isEmpty(pendingMultisigTransactions)
}
