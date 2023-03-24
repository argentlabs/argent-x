import useSWR from "swr"

import { getMultisigPendingTransactions } from "../../../../shared/multisig/pendingTransactionsStore"

export const useMultisigPendingTransaction = (requestId?: string) => {
  return useSWR(requestId, async () => {
    const pendingTransactions = await getMultisigPendingTransactions()
    const pendingTransaction = pendingTransactions.find(
      (transaction) => transaction.requestId === requestId,
    )
    return pendingTransaction
  })
}
