import { useEffect, useState } from "react"

import {
  MultisigPendingTransaction,
  getMultisigPendingTransactions,
} from "../../../../shared/multisig/pendingTransactionsStore"

export const useMultisigPendingTransaction = (requestId?: string) => {
  const [pendingTransaction, setPendingTransaction] = useState<
    MultisigPendingTransaction | undefined
  >(undefined)
  useEffect(() => {
    const retrievePendingTransaction = async () => {
      const pendingTransactions = await getMultisigPendingTransactions()
      console.log(pendingTransactions)
      const pendingTransaction = pendingTransactions.find(
        (transaction) => transaction.requestId === requestId,
      )
      setPendingTransaction(pendingTransaction)
    }
    retrievePendingTransaction()
  }, [requestId])
  return pendingTransaction
}
