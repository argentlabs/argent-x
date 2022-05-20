import { useEffect } from "react"

import { Pages, getAnalytics } from "../../shared/analytics"

/**
 * Lets switch to this analytics implementation once sendBeacon supports Authorization headers:
 * 
 * ```
    const isBrowser = typeof window !== "undefined"
    const supportsBeacon = isBrowser && "sendBeacon" in navigator

    const beaconFetcher = async (url: string, init?: RequestInit) => {
      if (supportsBeacon) {
        const blob = new Blob(
          [init?.body ? JSON.stringify(init.body) : ""],
          init?.headers as any,
        )
        navigator.sendBeacon(url, blob)
      } else {
        return fetch(url, init)
      }
    } 
  * ```
*/

export const analytics = getAnalytics(fetch)

export const usePageTrack = <T extends keyof Pages>(
  name: T,
  ...rest: Pages[T] extends undefined ? [data?: Pages[T]] : [data: Pages[T]]
) => {
  useEffect(() => {
    analytics.page(name, ...rest)
  }, [name, ...rest]) // as React in strict mode renders every component twice, this page will be tracked 2x in development. This is not the case in production.
}
