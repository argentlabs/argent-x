import { memoize } from "lodash-es"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { Transaction } from "../../../shared/transactions"
import { transactionsStore } from "../../../background/transactions/store"
import { useMemo } from "react"
import { TransactionExecutionStatus, TransactionFinalityStatus } from "starknet"

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

  const pendingTransactions = sortedTransactions.filter(
    ({ finalityStatus, executionStatus, meta }) =>
      finalityStatus === TransactionFinalityStatus.RECEIVED &&
      executionStatus !== TransactionExecutionStatus.REJECTED && // Rejected transactions have finality status RECEIVED
      meta?.isUpgrade,
  )

  return { transactions, pendingTransactions }
}
