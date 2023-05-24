import { useEffect } from "react"
import useSWR, { BareFetcher, Key, SWRConfiguration, useSWRConfig } from "swr"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

export const withPolling = (interval: number) => ({
  refreshInterval: interval,
  dedupingInterval: interval /** dedupe multiple requests */,
})

export const getAccountIdentifier = (account: any) =>
  `${account.networkId}::${account.address}`

/** SWR fetcher used by useConditionallyEnabledSWR when disabled */

const fetcherDisabled: BareFetcher<any> = () => undefined

/**
 * `useSWR` with additional flag that will enable or disable calling the fetcher and clears data when disabled
 *
 * This is useful when data fetching may be dependent on a user setting
 */

export function useConditionallyEnabledSWR<Data = any, Error = any>(
  enabled: boolean,
  key: Key,
  fetcher: BareFetcher<Data> | null,
  config?: SWRConfiguration<Data, Error, BareFetcher<Data>>,
) {
  /** fetcher conditional on enabled */
  const { cache } = useSWRConfig()
  const result = useSWR<Data, Error>(
    enabled && key,
    enabled ? fetcher : fetcherDisabled,
    config,
  )
  /** reset the cache when disabled */
  useEffect(() => {
    if (!enabled) {
      result.mutate()
      cache.delete(key)
    }
    // dont add result to dependencies to avoid revalidating on every render
  }, [enabled])
  return result
}
