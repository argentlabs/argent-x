import { isFunction, isNil } from "lodash-es"

import { parseConfig } from "./helpers"
import { Config } from "./types"

// modified from https://github.com/jperasmus/stale-while-revalidate-cache

type StaleWhileRevalidateCache = <ReturnValue>(
  cacheKey: string | (() => string),
  fn: () => ReturnValue,
) => Promise<ReturnValue>

export function createStaleWhileRevalidateCache(
  config: Config,
): StaleWhileRevalidateCache {
  const { storage, minTimeToStale, maxTimeToLive, serialize, deserialize } =
    parseConfig(config)

  async function staleWhileRevalidate<ReturnValue>(
    cacheKey: string | (() => string),
    fn: () => ReturnValue,
  ): Promise<ReturnValue> {
    const key = isFunction(cacheKey) ? String(cacheKey()) : String(cacheKey)
    const timeKey = `${key}_time`

    async function retrieveCachedValue() {
      try {
        const [cachedValue, cachedTime] = await Promise.all([
          storage.getItem(key),
          storage.getItem(timeKey),
        ])

        let deserializedCachedValue = deserialize(cachedValue)

        if (isNil(deserializedCachedValue)) {
          return { cachedValue: null, cachedAge: 0 }
        }

        const now = Date.now()
        const cachedAge = now - Number(cachedTime)

        if (cachedAge > maxTimeToLive) {
          deserializedCachedValue = null
        }

        return { cachedValue: deserializedCachedValue, cachedAge }
      } catch (error) {
        return { cachedValue: null, cachedAge: 0 }
      }
    }

    async function persistValue(result: ReturnValue) {
      try {
        await Promise.all([
          storage.setItem(key, serialize(result)),
          storage.setItem(timeKey, Date.now().toString()),
        ])
      } catch (error) {
        // Ignore
      }
    }

    async function revalidate() {
      const result = await fn()

      // Intentionally persisting asynchronously and not blocking since there is
      // in any case a chance for a race condition to occur when using an external
      // persistence store, like Redis, with multiple consumers. The impact is low.
      persistValue(result)

      return result
    }

    const { cachedValue, cachedAge } = await retrieveCachedValue()

    if (!isNil(cachedValue)) {
      if (cachedAge >= minTimeToStale) {
        // Non-blocking so that revalidation runs while stale cache data is returned
        // Error handled in `revalidate` by emitting an event, so only need a no-op here
        revalidate().catch(() => {
          /* no-op */
        })
      }

      return cachedValue as ReturnValue
    }

    return revalidate()
  }

  return staleWhileRevalidate
}
