import { useCallback, useMemo } from "react"
import { SWRConfiguration } from "swr"
import useSWRInfinite from "swr/infinite"
import urlJoin from "url-join"

import {
  ARGENT_EXPLORER_BASE_URL,
  ARGENT_EXPLORER_ENABLED,
} from "../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../shared/api/fetcher"
import { IExplorerTransaction } from "../../../shared/explorer/type"
import { urlWithQuery } from "../../../shared/utils/url"
import { argentApiFetcher } from "../../services/argentApiFetcher"
import {
  useConditionallyEnabledSWR,
  withPolling,
} from "../../services/swr.service"
import { stripAddressZeroPadding } from "../accounts/accounts.service"
import { RefreshInterval } from "../../../shared/config"

export const useArgentExplorerEnabled = () => {
  return ARGENT_EXPLORER_ENABLED
}

export const useArgentExplorerTransaction = ({
  hash,
  network,
}: {
  hash?: string
  network: string
}) => {
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const apiNetwork = argentApiNetworkForNetwork(network)
  return useConditionallyEnabledSWR<IExplorerTransaction>(
    Boolean(apiNetwork && argentExplorerEnabled),
    hash &&
      apiNetwork &&
      ARGENT_EXPLORER_BASE_URL &&
      urlJoin(ARGENT_EXPLORER_BASE_URL, "transactions", apiNetwork, hash),
    argentApiFetcher,
  )
}

export interface IUseArgentExplorerAccountTransactions {
  accountAddress?: string
  network: string
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
      apiNetwork &&
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
    Boolean(apiNetwork && argentExplorerEnabled),
    key,
    argentApiFetcher,
    withPolling(RefreshInterval.FAST * 1000) /** 20 seconds */,
  )
}

export const useArgentExplorerAccountTransactionsInfinite = (
  {
    accountAddress,
    network,
    pageSize = 10,
    direction = "DESC",
    withTransfers = true,
  }: IUseArgentExplorerAccountTransactions,
  config?: SWRConfiguration,
) => {
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const apiNetwork = argentApiNetworkForNetwork(network)
  const key = useCallback(
    (index: number) => {
      return (
        argentExplorerEnabled &&
        accountAddress &&
        apiNetwork &&
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
    shouldRetryOnError: false /** expect errors on unsupported networks */,
    ...withPolling(RefreshInterval.FAST * 1000) /** 20 seconds */,
    ...config,
  })
}
