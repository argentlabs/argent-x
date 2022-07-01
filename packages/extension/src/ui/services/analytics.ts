import { useEffect } from "react"
import { persist } from "zustand/middleware"
import create from "zustand/react"

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

export const usePageTracking = <T extends keyof Pages>(
  name: T,
  ...rest: Pages[T] extends undefined ? [data?: Pages[T]] : [data: Pages[T]]
) => {
  useEffect(() => {
    try {
      analytics.page(name, ...rest)
    } catch (e) {
      // nothing of this should be blocking
    }
  }, [name, ...rest]) // as React in strict mode renders every component twice, this page will be tracked 2x in development. This is not the case in production.
}

interface ActiveStoreValues {
  lastOpened: number
  lastUnlocked: number
}
interface ActiveStore extends ActiveStoreValues {
  update: (key: keyof ActiveStoreValues) => void
}
const activeStore = create<ActiveStore>(
  persist(
    (set) => ({
      lastOpened: 0, // defaults to tracking once when no value set yet
      lastUnlocked: 0, // defaults to tracking once when no value set yet
      update: (key) => set((state) => ({ ...state, [key]: Date.now() })),
    }),
    {
      name: "lastSeen",
    },
  ),
)

const N_24_HOURS = 24 * 60 * 60 * 1000

function openedExtensionTodayTracking() {
  try {
    if (Date.now() - activeStore.getState().lastOpened > N_24_HOURS) {
      activeStore.getState().update("lastOpened")
      analytics.track("openedExtensionToday")
    }
  } catch (e) {
    // nothing of this should be blocking
  }
}
export const useOpenedExtensionTodayTracking = () => {
  useEffect(() => {
    openedExtensionTodayTracking()
  }, [])
}

export function unlockedExtensionTodayTracking() {
  try {
    // track once every 24h
    if (Date.now() - activeStore.getState().lastOpened > N_24_HOURS) {
      activeStore.getState().update("lastUnlocked")
      analytics.track("unlockedExtensionToday")
    }
  } catch (e) {
    // nothing of this should be blocking
  }
}
