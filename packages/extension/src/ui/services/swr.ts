import { useEffect } from "react"
import useSWR, {
  BareFetcher,
  Cache,
  Key,
  SWRConfiguration,
  State,
  unstable_serialize,
  useSWRConfig,
} from "swr"

import { reviveJsonBigNumber } from "../../shared/json"

export interface SWRConfigCommon {
  suspense?: boolean
  refreshInterval?: number
  errorRetryInterval?: number
}

const swrStateCache: Cache = new Map()

const swrPersistedCache: Cache = {
  keys: function* (): IterableIterator<string> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        yield key
      }
    }
  },
  set: (key, value) => {
    try {
      if (value && value.data) {
        return localStorage.setItem(
          unstable_serialize(key),
          JSON.stringify(value.data),
        )
      }
    } catch (e) {
      console.log(e)
    }
  },
  get: <K extends keyof Cache>(key: K): State<Cache[K]> | undefined => {
    try {
      const value = localStorage.getItem(unstable_serialize(key))
      if (!value) {
        return { error: "No value found" }
      }
      return { data: JSON.parse(value, reviveJsonBigNumber) ?? undefined }
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
  keys: function* (): IterableIterator<string> {
    const keys = [...swrStateCache.keys(), ...swrPersistedCache.keys()]
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key !== null) {
        yield key
      }
    }
  },
}
