import { Transaction } from "../../../shared/transactions"
import { useMemo } from "react"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isSafeUpgradeTransaction"
import { useView } from "../../views/implementation/react"
import { networkTransactionsView } from "../../views/transactions"

type UseTransactionsOnNetwork = (networkId?: string) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

export const useUpgradeTransactionsOnNetwork: UseTransactionsOnNetwork = (
  networkId,
) => {
  const transactions = useView(networkTransactionsView(networkId))

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  const pendingTransactions = sortedTransactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return (
      finality_status === "RECEIVED" && isSafeUpgradeTransaction(transaction)
    )
  })

  return { transactions, pendingTransactions }
}
