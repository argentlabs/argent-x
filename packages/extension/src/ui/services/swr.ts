import { useEffect } from "react"
import useSWR, { BareFetcher, Cache, Key, SWRConfiguration } from "swr"

import { reviveJsonBigNumber } from "../../shared/json"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

export const swrCacheProvider: Cache = {
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get: (key: string) => {
    const value = localStorage.getItem(key)
    if (!value) {
      return undefined
    }
    try {
      return JSON.parse(value, reviveJsonBigNumber) ?? undefined
    } catch {
      return undefined
    }
  },
  delete: (key: string) => {
    localStorage.removeItem(key)
  },
}

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
  const result = useSWR<Data, Error>(
    key,
    enabled ? fetcher : fetcherDisabled,
    config,
  )
  /** revalidate when enabled changes */
  useEffect(() => {
    result.mutate()
  }, [enabled])
  return result
}
