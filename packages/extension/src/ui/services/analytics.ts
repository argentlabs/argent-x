import { isFunction } from "lodash-es"
import { useCallback, useEffect, useRef } from "react"

import {
  AddFundsServices,
  Events,
  activeStore,
  getAnalytics,
} from "../../shared/analytics"

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

export const useTimeSpentWithSuccessTracking = <T extends keyof Events>(
  event: T,
  args: Events[T] | (() => Promise<Events[T]>),
) => {
  const didTrack = useRef(false)
  const startedAt = useRef(new Date().getTime())

  /** track once with success flag */
  const trackWithSuccess = useCallback(
    async (success: boolean) => {
      if (didTrack.current) {
        /** already tracked */
        return
      }
      const timeSpent = new Date().getTime() - startedAt.current
      if (!success) {
        window.localStorage.setItem("failure", new Date().toISOString())
      }
      didTrack.current = true
      const resolvedArgs = isFunction(args) ? await args() : args
      void analytics.track(event, {
        ...resolvedArgs,
        success,
        timeSpent,
      })
    },
    [args, event],
  )

  const trackSuccess = useCallback(
    () => trackWithSuccess(true),
    [trackWithSuccess],
  )
  const trackFailure = useCallback(
    () => trackWithSuccess(false),
    [trackWithSuccess],
  )

  /** track failure on document close */
  useEffect(() => {
    const onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const timeSpent = new Date().getTime() - startedAt.current
        /** don't track failure unless window was open > 500ms */
        if (timeSpent > 500) {
          void trackFailure()
        }
      }
    }
    document.addEventListener("visibilitychange", onvisibilitychange)
    return () =>
      document.removeEventListener("visibilitychange", onvisibilitychange)
  }, [trackFailure])

  return {
    trackSuccess,
    trackFailure,
  }
}

const N_5_MINUTES = 5 * 60 * 1000
const N_24_HOURS = 24 * 60 * 60 * 1000
const N_1_WEEK = 7 * N_24_HOURS
const N_1_MONTH = 4 * N_1_WEEK

async function openedExtensionTodayTracking() {
  try {
    const lastOpened = await activeStore.get("lastOpened")
    if (Date.now() - lastOpened > N_24_HOURS) {
      await activeStore.update("lastOpened")
      void analytics.track("openedExtensionToday")
    }
  } catch (e) {
    // nothing of this should be blocking
  }
}

export async function unlockedExtensionTracking() {
  try {
    const lastUnlocked = await activeStore.get("lastUnlocked")
    // track once every 24h
    if (Date.now() - lastUnlocked > N_24_HOURS) {
      await activeStore.update("lastUnlocked")
      void analytics.track("unlockedExtensionToday")

      if (Date.now() - lastUnlocked > N_1_WEEK) {
        void analytics.track("unlockedExtensionWeekly")
      }
      if (Date.now() - lastUnlocked > N_1_MONTH) {
        void analytics.track("unlockedExtensionMonthly")
      }
    }
  } catch (e) {
    // nothing of this should be blocking
  }
}

async function sessionStartTracking() {
  try {
    const [lastSession, lastClosed] = await Promise.all([
      activeStore.get("lastSession"),
      activeStore.get("lastClosed"),
    ])
    // track once every 5 minutes
    if (Date.now() - lastSession > N_5_MINUTES) {
      await analytics.track("sessionStart")
      // ...and also if extension was closed for 5 minutes
      if (Date.now() - lastClosed > N_5_MINUTES) {
        const length = lastClosed - lastSession
        await analytics.track("sessionEnded", { length })
      }
    }
    await activeStore.update("lastSession")
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
    // as React in strict mode renders every component twice, this will be called 2x in development. This is not the case in production.
    void sessionStartTracking()
    void openedExtensionTodayTracking()
    return () => {
      /**
       * NOTE: any code here may run in dev but will not be triggered in a production build
       * and therefore cannot be used for 'extension closed' events
       *
       * @see initUiExtensionCloseListener and initBackgroundExtensionCloseListener for solution
       */
    }
  }, [])
}
