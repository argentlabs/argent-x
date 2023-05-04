import { Status } from "starknet"

import { ARGENT_EXPLORER_BASE_URL } from "../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../shared/api/fetcher"
import { Network } from "../../../shared/network"
import { Transaction, compareTransactions } from "../../../shared/transactions"
import { urlWithQuery } from "../../../shared/utils/url"
import { WalletAccount } from "../../../shared/wallet.model"
import { stripAddressZeroPadding } from "../../../ui/features/accounts/accounts.service"
import { fetchWithTimeout } from "../../utils/fetchWithTimeout"
import { mapVoyagerTransactionToTransaction } from "../transformers"

export interface VoyagerTransaction {
  blockId: string
  blockNumber: number
  hash: string
  index: number
  timestamp: number
  type: string
  status: Status
}

export const fetchVoyagerTransactions = async (
  address: string,
  network: Network,
): Promise<VoyagerTransaction[]> => {
  const explorerUrl = ARGENT_EXPLORER_BASE_URL
  const apiNetwork = argentApiNetworkForNetwork(network.id)
  if (!explorerUrl || !apiNetwork) {
    return []
  }

  const url = urlWithQuery(
    [
      explorerUrl,
      "accounts",
      apiNetwork,
      stripAddressZeroPadding(address),
      "voyager",
    ],
    {
      page: 0,
      size: 100,
      direction: "DESC",
      withTransfers: true,
    },
  )

  const response = await fetchWithTimeout(url)
  const { items } = await response.json()
  return items
}

export async function getTransactionHistory(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
) {
  const accountsWithHistory = accountsToPopulate.filter((account) =>
    Boolean(account.network?.explorerUrl),
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
