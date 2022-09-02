import { useCallback, useMemo } from "react"
import useSWRInfinite from "swr/infinite"
import urlJoin from "url-join"

import {
  ARGENT_EXPLORER_BASE_URL,
  ARGENT_EXPLORER_ENABLED,
} from "../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../shared/api/fetcher"
import { IExplorerTransaction } from "../../../shared/explorer/type"
import { PublicNetworkIds } from "../../../shared/network/public"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { urlWithQuery } from "../../../shared/utils/url"
import { argentApiFetcher } from "../../services/argentApiFetcher"
import { useConditionallyEnabledSWR, withPolling } from "../../services/swr"
import { stripAddressZeroPadding } from "../accounts/accounts.service"

export const useArgentExplorerEnabled = () => {
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_EXPLORER_ENABLED
  }
  return ARGENT_EXPLORER_ENABLED && privacyUseArgentServices
}

export const useArgentExplorerTransaction = ({
  hash,
  network,
}: {
  hash?: string
  network: PublicNetworkIds | string
}) => {
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const apiNetwork = argentApiNetworkForNetwork(network)
  return useConditionallyEnabledSWR<IExplorerTransaction>(
    argentExplorerEnabled,
    hash &&
      ARGENT_EXPLORER_BASE_URL &&
      urlJoin(ARGENT_EXPLORER_BASE_URL, "transactions", apiNetwork, hash),
    argentApiFetcher,
  )
}

export interface IUseArgentExplorerAccountTransactions {
  accountAddress?: string
  network: PublicNetworkIds
  page?: number
  pageSize?: number
  direction?: "DESC" | "ASC"
  withTransfers?: boolean
}

export const useArgentExplorerAccountTransactions = ({
  accountAddress,
  network,
  page = 0,
  pageSize = 100,
  direction = "DESC",
  withTransfers = true,
}: IUseArgentExplorerAccountTransactions) => {
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const apiNetwork = argentApiNetworkForNetwork(network)
  const key = useMemo(() => {
    return (
      accountAddress &&
      ARGENT_EXPLORER_BASE_URL &&
      urlWithQuery(
        [
          ARGENT_EXPLORER_BASE_URL,
          "accounts",
          apiNetwork,
          stripAddressZeroPadding(accountAddress),
          "transactions",
        ],
        {
          page,
          size: pageSize,
          direction,
          withTransfers,
        },
      )
    )
  }, [accountAddress, apiNetwork, direction, page, pageSize, withTransfers])
  return useConditionallyEnabledSWR<IExplorerTransaction[]>(
    argentExplorerEnabled,
    key,
    argentApiFetcher,
    withPolling(15 * 1000) /** 15 seconds */,
  )
}

export const useArgentExplorerAccountTransactionsInfinite = ({
  accountAddress,
  network,
  pageSize = 10,
  direction = "DESC",
  withTransfers = true,
}: IUseArgentExplorerAccountTransactions) => {
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const apiNetwork = argentApiNetworkForNetwork(network)
  const key = useCallback(
    (index: number) => {
      return (
        argentExplorerEnabled &&
        accountAddress &&
        ARGENT_EXPLORER_BASE_URL &&
        urlWithQuery(
          [
            ARGENT_EXPLORER_BASE_URL,
            "accounts",
            apiNetwork,
            stripAddressZeroPadding(accountAddress),
            "transactions",
          ],
          {
            page: index,
            size: pageSize,
            direction,
            withTransfers,
          },
        )
      )
    },
    [
      accountAddress,
      apiNetwork,
      argentExplorerEnabled,
      direction,
      pageSize,
      withTransfers,
    ],
  )
  return useSWRInfinite<IExplorerTransaction[]>(key, argentApiFetcher, {
    revalidateAll: true,
    ...withPolling(15 * 1000) /** 15 seconds */,
  })
}
