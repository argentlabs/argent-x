import { encodeBase64 } from "ethers"
import { encode } from "starknet"
import browser from "webextension-polyfill"
import create from "zustand"
import { persist } from "zustand/middleware"

const SEGMENT_TRACK_URL = "https://api.segment.io/v1/track"
const SEGMENT_PAGE_URL = "https://api.segment.io/v1/page"

// dont use destructuring here
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY
const VERSION = process.env.VERSION

export type AddFundsServices =
  | "banxa"
  | "layerswap"
  | "starkgate"
  | "orbiter"
  | "ramp"

export type UserFeedbackAction =
  | "REVIEWED_ON_CHROME_STORE"
  | "REVIEWED_ON_ZENDESK"
  | "RATING_DISMISSED"
  | "FEEDBACK_DISMISSED"

export interface Events {
  sessionStart: undefined
  sessionEnded: {
    length: number
  }
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
  createAccount:
    | {
        status: "success"
        networkId: string
      }
    | {
        status: "failure"
        errorMessage: string
        networkId: string
      }
  deployAccount:
    | {
        status: "success"
        trigger: "sign" | "transaction"
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
    host?: string
  }
  sentTransaction: {
    success: boolean
    networkId: string
    host?: string
  }
  rejectedTransaction: {
    networkId: string
    host?: string
  }
  signedMessage: {
    networkId: string
  }
  addFunds: {
    networkId: string
    service: AddFundsServices
  }
  userRating: {
    rating: number
  }
  userFeedbackAction: {
    action: UserFeedbackAction
  }
  signedDeclareTransaction: {
    networkId: string
  }
  signedDeployTransaction: {
    networkId: string
  }
  swapInitiated: {
    networkId: string
    pair: string
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
  signDeclareTransaction: {
    networkId: string
  }
  signDeployTransaction: {
    networkId: string
  }
  addFunds: {
    networkId: string
  }
  addFundsFromOtherAccount: {
    networkId: string
  }
  swap: {
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
  Authorization: `Basic ${encodeBase64(
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
        return await fetch(SEGMENT_TRACK_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
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
        return await fetch(SEGMENT_PAGE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
      } catch {
        // ignore
      }
    },
  }
}

interface ActiveStoreValues {
  lastOpened: number
  lastUnlocked: number
  lastSession: number
  lastClosed: number
}

interface ActiveStore extends ActiveStoreValues {
  update: (key: keyof ActiveStoreValues) => void
}

export const activeStore = create<ActiveStore>(
  persist(
    (set) => ({
      lastOpened: 0, // defaults to tracking once when no value set yet
      lastUnlocked: 0, // defaults to tracking once when no value set yet
      lastSession: 0, // defaults to tracking once when no value set yet
      lastClosed: 0, // defaults to tracking once when no value set yet
      update: (key) => set((state) => ({ ...state, [key]: Date.now() })),
    }),
    {
      name: "lastSeen",
    },
  ),
)

/*
 * There is no usable 'close' event on an extension
 *
 * instead we open a message port to the extension and simply listen for it to be disconnected
 * as a side-effect of the extension being closed
 */

const EXTENSION_CONNECT_ID = "argent-x-analytics-connect"

/** listen for the port connection from the UI, then detect disconnection */
export const initBackgroundExtensionCloseListener = () => {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === EXTENSION_CONNECT_ID) {
      port.onDisconnect.addListener(() => {
        /** Extension was closed */
        activeStore.getState().update("lastClosed")
      })
    }
  })
}

/** connect to the background port from the UI */
export const initUiExtensionCloseListener = () => {
  browser.runtime.connect({ name: EXTENSION_CONNECT_ID })
}
