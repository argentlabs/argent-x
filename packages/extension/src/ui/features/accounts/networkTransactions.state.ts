import { memoize } from "lodash-es"
import { useArrayStorage } from "../../hooks/useStorage"
import { Transaction } from "../../../shared/transactions"
import { transactionsStore } from "../../../shared/transactions/store"
import { useMemo } from "react"
import { getTransactionStatus } from "../../../shared/transactions/utils"

type UseTransactionsOnNetwork = (networkId?: string) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const byNetworkSelector = memoize(
  (networkId?: string) => (transaction: Transaction) =>
    Boolean(networkId && transaction.account.networkId === networkId),
  (networkId) => (networkId ? networkId : "unknown-network"),
)

export const useUpgradeTransactionsOnNetwork: UseTransactionsOnNetwork = (
  networkId,
) => {
  const transactions = useArrayStorage(
    transactionsStore,
    byNetworkSelector(networkId),
  )

  const sortedTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  const pendingTransactions = sortedTransactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return finality_status === "RECEIVED" && transaction.meta?.isUpgrade
  })

  return { transactions, pendingTransactions }
}
