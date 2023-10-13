import { base64 } from "ethers/lib/utils"
import { encode } from "starknet"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { CreateAccountType } from "./wallet.model"

const SEGMENT_TRACK_URL = "https://api.segment.io/v1/track"

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
        type: CreateAccountType
      }
    | {
        status: "failure"
        errorMessage: string
        networkId: string
        type: CreateAccountType
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
  deployMultisig:
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
  executeTransaction: {
    usesCachedFees: boolean
  }
  onboardingStepFinished: {
    timeSpent?: number
    successful?: boolean
    stepId:
      | "welcome"
      | "disclaimer"
      | "restoreSeedphrase"
      | "newWalletPassword"
      | "finish"
  }
  argentShieldOnboardingStepFinished: {
    timeSpent?: number
    successful?: boolean
    stepId:
      | "welcome"
      | "enterEmail"
      | "enterPasscode"
      | "addArgentShield"
      | "addArgentShieldFinish"
    accountsWith2fa?: number
    authenticated?: boolean
  }
  argentShieldRemovalStepFinished: {
    timeSpent?: number
    successful?: boolean
    stepId:
      | "welcome"
      | "enterEmail"
      | "enterPasscode"
      | "removeArgentShield"
      | "removeArgentShieldFinish"
    accountsWith2fa?: number
    authenticated?: boolean
  }
  argentShieldError: {
    errorId: "emailNotMatch" | "emailAlreadyInUseForOtherSeedphrase"
    accountsWith2fa?: number
    authenticated?: boolean
  }
  argentShieldEscapeScreenSeen: {
    escapeId: "escapeGuardian" | "escapeSigner"
    remainingTime: number
  }
  argentShieldEscapeScreenAction:
    | {
        remainingTime: number
      } & (
        | {
            escapeId: "escapeGuardian"
            action:
              | "dismiss"
              | "detailedInstructions"
              | "keepArgentShield"
              | "continueWithRemoval"
              | "removeArgentShield"
          }
        | {
            escapeId: "escapeSigner"
            action:
              | "dismiss"
              | "detailedInstructions"
              | "contactArgentSupport"
              | "cancelKeyChange"
              | "startRemoval"
          }
      )
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
        console.groupCollapsed(`Analytics: ${event}`)
        console.log("You see this log because no SEGMENT_WRITE_KEY is set")
        console.log(data)
        console.groupEnd()
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

export type IActiveStore = typeof activeStore

export const activeStore = create<ActiveStore>()(
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
