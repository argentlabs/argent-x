import { SupportedNetworks } from "@argent/x-swap"
import { memoize } from "lodash-es"
import { useMemo } from "react"
import useSWR from "swr"

import { getMultisigRequestData } from "../../../shared/multisig/multisig.service"
import {
  MultisigPendingTransaction,
  multisigPendingTransactionsStore,
  removeFromMultisigPendingTransactions,
} from "../../../shared/multisig/pendingTransactionsStore"
import { useArrayStorage } from "../../../shared/storage/hooks"
import {
  chainIdToStarknetNetwork,
  networkNameToChainId,
} from "../../../shared/utils/starknetNetwork"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"

export type EnrichedMultisigPendingTransaction = MultisigPendingTransaction & {
  data: Awaited<ReturnType<typeof getMultisigRequestData>>
}
type UseMultisigAccountPendingTransactions = (account?: BaseWalletAccount) => {
  enrichedPendingMultisigTransactions?: EnrichedMultisigPendingTransaction[]
}

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: MultisigPendingTransaction) =>
    Boolean(account && transaction.address === account.address),
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export const useMultisigAccountPendingTransactions: UseMultisigAccountPendingTransactions =
  (account) => {
    const transactions = useArrayStorage(
      multisigPendingTransactionsStore,
      byAccountSelector(account),
    )
    const sortedMultisigTransactions = useMemo(
      () => transactions.sort((a, b) => b.timestamp - a.timestamp),
      [transactions],
    )
    const { data } = useSWR(
      [account ? getAccountIdentifier(account) : "", "multisigRequests"],
      async () => {
        if (!account) {
          return []
        }
        const enrichedPendingMultisigTransactions: EnrichedMultisigPendingTransaction[] =
          []
        for (const transaction of sortedMultisigTransactions) {
          const request = await getMultisigRequestData({
            address: account.address,
            networkId: chainIdToStarknetNetwork(
              networkNameToChainId(transaction.networkId as SupportedNetworks),
            ),
            requestId: transaction.requestId,
          })
          if (request.content.state === "AWAITING_SIGNATURES") {
            enrichedPendingMultisigTransactions.push({
              ...transaction,
              data: request,
            })
          } else {
            // If it's not awaiting signatures it should not be stored here anymore
            removeFromMultisigPendingTransactions(transaction)
          }
        }
        return enrichedPendingMultisigTransactions
      },
      {
        suspense: false,
        refreshInterval: 20 * 1000, // 20 seconds
        shouldRetryOnError: false,
      },
    )

    return { enrichedPendingMultisigTransactions: data }
  }
