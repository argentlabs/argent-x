import { useEffect } from "react"
import create from "zustand"
import { persist } from "zustand/middleware"

import { AddFundsServices, Pages, getAnalytics } from "../../shared/analytics"
import { useNetworkLogs } from "./../../ui/features/settings/networkLogs.state"

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

const [ , addNetworkLog] = useNetworkLogs()
export const analytics = getAnalytics(fetch, addNetworkLog)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, rest[0]]) // as React in strict mode renders every component twice, this page will be tracked 2x in development. This is not the case in production.
}

interface ActiveStoreValues {
  lastOpened: number
  lastUnlocked: number
  lastSession: number
}
interface ActiveStore extends ActiveStoreValues {
  update: (key: keyof ActiveStoreValues) => void
}
const activeStore = create<ActiveStore>(
  persist(
    (set) => ({
      lastOpened: 0, // defaults to tracking once when no value set yet
      lastUnlocked: 0, // defaults to tracking once when no value set yet
      lastSession: 0, // defaults to tracking once when no value set yet
      update: (key) => set((state) => ({ ...state, [key]: Date.now() })),
    }),
    {
      name: "lastSeen",
    },
  ),
)

const N_5_MINUTES = 5 * 60 * 1000
const N_24_HOURS = 24 * 60 * 60 * 1000
const N_1_WEEK = 7 * N_24_HOURS
const N_1_MONTH = 4 * N_1_WEEK

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

export function unlockedExtensionTracking() {
  try {
    const { lastUnlocked } = activeStore.getState()
    // track once every 24h
    if (Date.now() - lastUnlocked > N_24_HOURS) {
      activeStore.getState().update("lastUnlocked")
      analytics.track("unlockedExtensionToday")

      if (Date.now() - lastUnlocked > N_1_WEEK) {
        analytics.track("unlockedExtensionWeekly")
      }
      if (Date.now() - lastUnlocked > N_1_MONTH) {
        analytics.track("unlockedExtensionMonthly")
      }
    }
  } catch (e) {
    // nothing of this should be blocking
  }
}

export function sessionStartTracking() {
  try {
    // track once every 5 minutes
    if (Date.now() - activeStore.getState().lastSession > N_5_MINUTES) {
      analytics.track("sessionStart")
    }
    activeStore.getState().update("lastSession")
  } catch (e) {
    // nothing of this should be blocking
  }
}

export function trackAddFundsService(
  service: AddFundsServices,
  networkId: string,
) {
  return () => analytics.track("addFunds", { service, networkId })
}

export const useTracking = () => {
  useEffect(() => {
    sessionStartTracking()
    openedExtensionTodayTracking()
  }, [])
}
