import join from "url-join"

import { Network, isKnownNetwork } from "../../shared/networks"
import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { analytics } from "../analytics"
import { fetchWithTimeout } from "../utils/fetchWithTimeout"
import { mapVoyagerTransactionToTransaction } from "./transformers"

export interface VoyagerTransaction {
  blockId: string
  entry_point_type: string | null
  globalIndex?: number
  hash: string
  index: number
  signature: string[] | null
  timestamp: number
  to: string
  type: string
}

export const fetchVoyagerTransactions = async (
  address: string,
  network: Network,
): Promise<VoyagerTransaction[]> => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return []
  }
  analytics.track("voyagerCalled", { endpoint: "txns", networkId: network.id })
  const response = await fetchWithTimeout(
    join(explorerUrl, `api/txns?to=${address}`),
  )
  const { items } = await response.json()
  return items
}

export type FetchTransactions = typeof fetchVoyagerTransactions

export async function getTransactionHistory(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
  fetchTransactions: FetchTransactions,
) {
  const accountsWithHistory = accountsToPopulate.filter((account) =>
    isKnownNetwork(account.network.id),
  )
  const transactionsPerAccount = await Promise.all(
    accountsWithHistory.map(async (account) => {
      const voyagerTransactions = await fetchTransactions(
        account.address,
        account.network,
      )
      return voyagerTransactions.map((transaction) =>
        mapVoyagerTransactionToTransaction(
          transaction,
          account,
          metadataTransactions.find((tx) => tx.hash === transaction.hash)?.meta,
        ),
      )
    }),
  )
  return transactionsPerAccount.flat()
}
