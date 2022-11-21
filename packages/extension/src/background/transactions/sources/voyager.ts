import join from "url-join"

import { Network } from "../../../shared/network"
import { Transaction, compareTransactions } from "../../../shared/transactions"
import { WalletAccount } from "../../../shared/wallet.model"
import { fetchWithTimeout } from "../../utils/fetchWithTimeout"
import { mapVoyagerTransactionToTransaction } from "../transformers"

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
  const response = await fetchWithTimeout(
    join(explorerUrl, `api/txns?to=${address}`),
  )
  const { items } = await response.json()
  return items
}

export async function getTransactionHistory(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
) {
  const accountsWithHistory = accountsToPopulate.filter((account) =>
    Boolean(account.network.explorerUrl),
  )
  const transactionsPerAccount = await Promise.all(
    accountsWithHistory.map(async (account) => {
      const voyagerTransactions = await fetchVoyagerTransactions(
        account.address,
        account.network,
      )
      return voyagerTransactions.map((transaction) =>
        mapVoyagerTransactionToTransaction(
          transaction,
          account,
          metadataTransactions.find((tx) =>
            compareTransactions(tx, {
              hash: transaction.hash,
              account: { networkId: account.networkId },
            }),
          )?.meta,
        ),
      )
    }),
  )
  return transactionsPerAccount.flat()
}
