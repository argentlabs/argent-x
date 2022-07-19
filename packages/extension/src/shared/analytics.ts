import { base64 } from "ethers/lib/utils"
import { encode } from "starknet"

import { useNetworkLogsStore } from "./../ui/features/settings/networkLogs.state"

const SEGMENT_TRACK_URL = "https://api.segment.io/v1/track"
const SEGMENT_PAGE_URL = "https://api.segment.io/v1/page"

// dont use destructuring here
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY
const VERSION = process.env.VERSION
console.log("SEGMENT_WRITE_KEY", SEGMENT_WRITE_KEY)

export type AddFundsServices = "banxa" | "layerswap" | "starkgate"

export interface Events {
  sessionStart: undefined
  openedExtensionToday: undefined
  unlockedExtensionToday: undefined
  unlockedExtensionWeekly: undefined
  unlockedExtensionMonthly: undefined
  createWallet:
    | {
        status: "success"
        networkId: string
      }
    | {
        status: "failure"
        errorMessage: string
        networkId: string
      }
  preauthorizeDapp: {
    host: string
    networkId: string
  }
  signedTransaction: {
    networkId: string
  }
  sentTransaction: {
    success: boolean
    networkId: string
  }
  signedMessage: {
    networkId: string
  }
  addFunds: {
    networkId: string
    service: AddFundsServices
  }
}

export interface Pages {
  welcome: undefined
  disclaimer: undefined
  createWallet: undefined
  restoreWallet: undefined
  restoreWalletWithFile: undefined
  signMessage: undefined
  signTransaction: {
    networkId: string
  }
  addFunds: {
    networkId: string
  }
  addFundsFromOtherAccount: {
    networkId: string
  }
}

interface Analytics {
  track<T extends keyof Events>(
    event: T,
    ...rest: Events[T] extends undefined // makes sure that the argument is optional if the event is not defined
      ? [data?: Events[T]]
      : [data: Events[T]]
  ): Promise<unknown>
  page<T extends keyof Pages>(
    name: T,
    ...rest: Pages[T] extends undefined ? [data?: Pages[T]] : [data: Pages[T]]
  ): Promise<unknown>
}

const versionRegex = /(\d+[._]\d+)([._]\d+)*/g // https://regex101.com/r/TgejzT/1
export function anonymizeUserAgent(userAgent?: string): string {
  if (!userAgent) {
    return "unknown"
  }
  return userAgent.replace(versionRegex, "$1")
}

export type Fetch = (url: string, init?: RequestInit) => Promise<unknown>

const defaultPayload = {
  userId: "00000",
  context: {
    ip: "0.0.0.0",
    app: {
      name: "Argent X",
      version: VERSION,
    },
    library: {
      name: "argent-x",
      version: VERSION,
    },
  },
}
const headers = {
  "Content-Type": "application/json",
  Authorization: `Basic ${base64.encode(
    encode.utf8ToArray(`${SEGMENT_WRITE_KEY}:`),
  )}`,
}

const isBrowser = typeof window !== "undefined"
const defaultUserAgent = isBrowser ? window.navigator.userAgent : "unknown"

export function getAnalytics(
  fetch: Fetch,
  userAgent = defaultUserAgent,
): Analytics {
  const prebuiltPayload = {
    ...defaultPayload,
    context: {
      ...defaultPayload.context,
      userAgent: anonymizeUserAgent(userAgent),
    },
  }
  return {
    track: async (event, ...[data]) => {
      if (!SEGMENT_WRITE_KEY) {
        return
      }
      const payload = {
        ...prebuiltPayload,
        event,
        properties: data,
        timestamp: new Date().toISOString(),
      }

      try {
        const networkLogs = useNetworkLogsStore.getState().networkLogs
        const data = {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
        networkLogs.push({ url: SEGMENT_TRACK_URL, ...data })
        console.log(data)
        useNetworkLogsStore.setState({ networkLogs })
        localStorage.setItem("networkLogs", JSON.stringify(networkLogs))
        return await fetch(SEGMENT_TRACK_URL, data)
      } catch {
        // ignore
      }
    },
    page: async (name, ...[data]) => {
      if (!SEGMENT_WRITE_KEY) {
        return
      }
      const payload = {
        ...prebuiltPayload,
        name,
        properties: data,
        timestamp: new Date().toISOString(),
      }
      try {
        const networkLogs = useNetworkLogsStore.getState().networkLogs

        const data = {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }

        networkLogs.push({ url: SEGMENT_PAGE_URL, ...data })

        console.log(data)
        useNetworkLogsStore.setState({ networkLogs })
        localStorage.setItem("networkLogs", JSON.stringify(networkLogs))

        return await fetch(SEGMENT_PAGE_URL, data)
      } catch {
        // ignore
      }
    },
  }
}
