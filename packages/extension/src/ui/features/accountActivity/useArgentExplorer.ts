import { useCallback, useMemo } from "react"
import useSWRInfinite from "swr/infinite"
import urlJoin from "url-join"

import {
  ARGENT_EXPLORER_BASE_URL,
  ARGENT_EXPLORER_ENABLED,
} from "../../../shared/api/constants"
import { IExplorerTransaction } from "../../../shared/explorer/type"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { urlWithQuery } from "../../../shared/utils/url"
import { useConditionallyEnabledSWR, withPolling } from "../../services/swr"
import { useArgentApiFetcher } from "../../services/useArgentApiFetcher"
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

export const useArgentExplorerTransaction = (txHash?: string) => {
  const fetcher = useArgentApiFetcher()
  const argentExplorerEnabled = useArgentExplorerEnabled()
  return useConditionallyEnabledSWR<IExplorerTransaction>(
    argentExplorerEnabled,
    txHash && urlJoin(ARGENT_EXPLORER_BASE_URL, "transactions", txHash),
    fetcher,
  )
}

export interface IUseArgentExplorerAccountTransactions {
  accountAddress?: string
  page?: number
  pageSize?: number
  direction?: "DESC" | "ASC"
  withTransfers?: boolean
}

export const useArgentExplorerAccountTransactions = ({
  accountAddress,
  page = 0,
  pageSize = 100,
  direction = "DESC",
  withTransfers = true,
}: IUseArgentExplorerAccountTransactions) => {
  const fetcher = useArgentApiFetcher()
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const key = useMemo(() => {
    return (
      accountAddress &&
      urlWithQuery(
        [
          ARGENT_EXPLORER_BASE_URL,
          "accounts",
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
  }, [accountAddress, direction, page, pageSize, withTransfers])
  return useConditionallyEnabledSWR<IExplorerTransaction[]>(
    argentExplorerEnabled,
    key,
    fetcher,
    withPolling(15 * 1000) /** 15 seconds */,
  )
}

export const useArgentExplorerAccountTransactionsInfinite = ({
  accountAddress,
  pageSize = 10,
  direction = "DESC",
  withTransfers = true,
}: IUseArgentExplorerAccountTransactions) => {
  const fetcher = useArgentApiFetcher()
  const argentExplorerEnabled = useArgentExplorerEnabled()
  const key = useCallback(
    (index: number) => {
      return (
        argentExplorerEnabled &&
        accountAddress &&
        urlWithQuery(
          [
            ARGENT_EXPLORER_BASE_URL,
            "accounts",
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
    [accountAddress, argentExplorerEnabled, direction, pageSize, withTransfers],
  )
  return useSWRInfinite<IExplorerTransaction[]>(key, fetcher, {
    revalidateAll: true,
    ...withPolling(15 * 1000) /** 15 seconds */,
  })
}
