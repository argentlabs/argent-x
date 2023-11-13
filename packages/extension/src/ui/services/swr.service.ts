import { useEffect } from "react"
import useSWR, {
  BareFetcher,
  Cache,
  Key,
  SWRConfiguration,
  unstable_serialize,
  useSWRConfig,
  Revalidator,
  RevalidatorOptions,
} from "swr"

import { reviveJsonBigNumber } from "../../shared/json"
import { checkStorageAndPrune } from "../../shared/storage/__new/prune"
import { isFunction, isUndefined } from "lodash-es"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

const swrStateCache: Cache = new Map()

const swrPersistedCache: Cache = {
  set: (key, value) => {
    checkStorageAndPrune()
    return localStorage.setItem(
      unstable_serialize(key),
      JSON.stringify(value, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    )
  },
  get: (key) => {
    try {
      const value = localStorage.getItem(unstable_serialize(key))
      if (!value) {
        throw new Error("No value found")
      }
      return JSON.parse(value, reviveJsonBigNumber) ?? undefined
    } catch {
      return undefined
    }
  },
  delete: (key) => {
    return localStorage.removeItem(unstable_serialize(key))
  },
}

/**
 * SWR config - refresh and dedupe for 'polling' behaviour, useful for polling services
 * NOTE: enabling deduping will naturally disable revalidation on mount etc.
 */

export const withPolling = (interval: number) => {
  return {
    refreshInterval: interval,
    dedupingInterval: interval /** dedupe multiple requests */,
  }
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
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps
  return result
}

const isSwrStateKey = (key: Key) => /^\$swr\$/g.test(unstable_serialize(key))
export const swrCacheProvider: Cache = {
  set: (key, value) => {
    if (isSwrStateKey(key)) {
      return swrStateCache.set(key, value)
    } else {
      return swrPersistedCache.set(key, value)
    }
  },
  get: (key) => {
    if (isSwrStateKey(key)) {
      return swrStateCache.get(key)
    } else {
      return swrPersistedCache.get(key)
    }
  },
  delete: (key) => {
    if (isSwrStateKey(key)) {
      return swrStateCache.delete(key)
    } else {
      return swrPersistedCache.delete(key)
    }
  },
}

const exponentialBackoff = (retryCount: number) =>
  (Math.pow(2, retryCount) - 1) * 1000

export function onErrorRetry<Data = any, Error = any>(
  error: any,
  key: string,
  config: SWRConfiguration<Data, Error>,
  revalidate: Revalidator,
  opts: RevalidatorOptions,
  getTimeout?: (retryCount: number) => number,
) {
  // We only want to retry on 429 and 5xx http errors
  if (error?.status < 500 && error?.status !== 429) {
    return
  }

  const maxRetryCount = config.errorRetryCount || 5 // A maximum of 5 retries
  const currentRetryCount = opts.retryCount

  if (isUndefined(maxRetryCount) || isUndefined(currentRetryCount)) {
    return
  }

  // 1s, 3s, 7s, 15s, 31s
  const timeout = isFunction(getTimeout)
    ? getTimeout(currentRetryCount)
    : exponentialBackoff(currentRetryCount)

  if (currentRetryCount >= maxRetryCount) {
    return
  }

  setTimeout(revalidate, timeout, opts)
}
