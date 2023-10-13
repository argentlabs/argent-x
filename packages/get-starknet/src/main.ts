import Bowser from "bowser"
import type {
  DisconnectOptions,
  GetWalletOptions,
  StarknetWindowObject,
} from "get-starknet-core"
import sn from "get-starknet-core"

import type { WalletProviderWithStoreVersion } from "./modal"
import show from "./modal"

export type {
  StarknetWindowObject,
  DisconnectOptions,
  ConnectedStarknetWindowObject,
} from "get-starknet-core"

type StoreVersion = "chrome" | "firefox" | "edge"

const DEFAULT_WEBWALLET_URL =
  process.env.NODE_ENV === "production"
    ? "https://web.argent.xyz"
    : "http://localhost:3005"

const DEFAULT_PROJECT_ID = "d7615e8fcbb3757ec0771a14ca715d09"

const argentXicon = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE4LjQwMTggNy41NTU1NkgxMy41OTgyQzEzLjQzNzcgNy41NTU1NiAxMy4zMDkxIDcuNjg3NDcgMTMuMzA1NiA3Ljg1MTQzQzEzLjIwODUgMTIuNDYwMyAxMC44NDg0IDE2LjgzNDcgNi43ODYwOCAxOS45MzMxQzYuNjU3MTEgMjAuMDMxNCA2LjYyNzczIDIwLjIxNjIgNi43MjIwMiAyMC4zNDkzTDkuNTMyNTMgMjQuMzE5NkM5LjYyODE1IDI0LjQ1NDggOS44MTQ0NCAyNC40ODUzIDkuOTQ1NTggMjQuMzg2QzEyLjQ4NTYgMjIuNDYxMyAxNC41Mjg3IDIwLjEzOTUgMTYgMTcuNTY2QzE3LjQ3MTMgMjAuMTM5NSAxOS41MTQ1IDIyLjQ2MTMgMjIuMDU0NSAyNC4zODZDMjIuMTg1NiAyNC40ODUzIDIyLjM3MTkgMjQuNDU0OCAyMi40Njc2IDI0LjMxOTZMMjUuMjc4MSAyMC4zNDkzQzI1LjM3MjMgMjAuMjE2MiAyNS4zNDI5IDIwLjAzMTQgMjUuMjE0IDE5LjkzMzFDMjEuMTUxNiAxNi44MzQ3IDE4Ljc5MTUgMTIuNDYwMyAxOC42OTQ2IDcuODUxNDNDMTguNjkxMSA3LjY4NzQ3IDE4LjU2MjMgNy41NTU1NiAxOC40MDE4IDcuNTU1NTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNzIzNiAxMC40OTJMMjQuMjIzMSA4LjkyNDM5QzI0LjEyMTMgOC42MDYxNCAyMy44NzM0IDguMzU4MjQgMjMuNTU3NyA4LjI2MDIzTDIyLjAwMzkgNy43NzU5NUMyMS43ODk1IDcuNzA5MDYgMjEuNzg3MyA3LjQwMTc3IDIyLjAwMTEgNy4zMzIwMUwyMy41NDY5IDYuODI0NjZDMjMuODYwOSA2LjcyMTQ2IDI0LjEwNiA2LjQ2OTUyIDI0LjIwMjcgNi4xNTAxMUwyNC42Nzk4IDQuNTc1MDJDMjQuNzQ1OCA0LjM1NzA5IDI1LjA0ODkgNC4zNTQ3NyAyNS4xMTgzIDQuNTcxNTZMMjUuNjE4OCA2LjEzOTE1QzI1LjcyMDYgNi40NTc0IDI1Ljk2ODYgNi43MDUzMSAyNi4yODQyIDYuODAzOUwyNy44MzggNy4yODc2MUMyOC4wNTI0IDcuMzU0NSAyOC4wNTQ3IDcuNjYxNzkgMjcuODQwOCA3LjczMjEzTDI2LjI5NSA4LjIzOTQ4QzI1Ljk4MTEgOC4zNDIxIDI1LjczNiA4LjU5NDA0IDI1LjYzOTMgOC45MTQwMkwyNS4xNjIxIDEwLjQ4ODVDMjUuMDk2MSAxMC43MDY1IDI0Ljc5MyAxMC43MDg4IDI0LjcyMzYgMTAuNDkyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==`

export const globalWindow = typeof window !== "undefined" ? window : null

function getStoreVersionFromBrowser(): StoreVersion | null {
  const browserName = Bowser.getParser(globalWindow?.navigator.userAgent)
    .getBrowserName()
    ?.toLowerCase()
  switch (browserName) {
    case "firefox":
      return "firefox"
    case "microsoft edge":
      return "edge"
    case "android browser":
    case "chrome":
    case "chromium":
    case "electron":
    case "opera": // opera is chromium based
    case "vivaldi": // vivaldi is chromium based
      return "chrome"
    default:
      return null
  }
}

export interface ConnectOptions extends GetWalletOptions {
  chainId?: "SN_GOERLI" | "SN_GOERLI2" | "SN_MAINNET"
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  modalWalletAppearance?: "email_only" | "all"
  storeVersion?: StoreVersion
  alwaysShowDiscovery?: boolean
  dappName?: string
  webWalletUrl?: string
  projectId?: string
  enableArgentMobile?: boolean
}

const enableWithVersion = async (wallet: StarknetWindowObject | null) => {
  if (!wallet) {
    return null
  }
  return sn.enable(wallet, { starknetVersion: "v4" })
}

export const connect = async ({
  modalMode = "canAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  alwaysShowDiscovery = true,
  dappName,
  webWalletUrl = DEFAULT_WEBWALLET_URL,
  projectId = DEFAULT_PROJECT_ID,
  modalWalletAppearance = "all",
  chainId = "SN_GOERLI",
  enableArgentMobile = false,
  ...restOptions
}: ConnectOptions = {}): Promise<StarknetWindowObject | null> => {
  restOptions.sort ??= ["argentX"]

  const preAuthorizedWallets = await sn.getPreAuthorizedWallets({
    ...restOptions,
  })

  const lastWallet = await sn.getLastConnectedWallet()
  if (modalMode === "neverAsk") {
    const wallet =
      preAuthorizedWallets.find((w) => w.id === lastWallet?.id) ??
      preAuthorizedWallets[0] // at this point pre-authorized is already sorted

    // return `wallet` even if it's null/undefined since we aren't allowed
    // to show any "connect" related UI
    return enableWithVersion(wallet)
  }

  const installedWallets = await sn.getAvailableWallets(restOptions)
  installedWallets.find((w) => {
    if (w.id === "argentX") {
      w.icon = argentXicon
    }
  })
  if (
    modalMode === "canAsk" &&
    // we return/display wallet options once per first-dapp (ever) connect
    lastWallet
  ) {
    const wallet =
      preAuthorizedWallets.find((w) => w.id === lastWallet?.id) ??
      installedWallets.length === 1
        ? installedWallets[0]
        : undefined
    if (wallet) {
      return enableWithVersion(wallet)
    } // otherwise fallback to modal
  }

  const enableArgentWebWallet = Boolean(
    restOptions.exclude?.every((id) => id !== "argentWebWallet") ??
      restOptions.include?.some((id) => id === "argentWebWallet") ??
      true,
  )

  const discoveryWallets = await sn.getDiscoveryWallets(restOptions)
  discoveryWallets.find((w) => {
    if (w.id === "argentX") {
      w.icon = argentXicon
    }
  })

  const discoveryWalletsByStoreVersion: WalletProviderWithStoreVersion[] =
    discoveryWallets
      .filter((w) => Boolean(w.downloads[storeVersion]))
      .filter(
        // if alwaysShowDiscovery=false: only show discovery wallets if there are no other options
        () =>
          alwaysShowDiscovery ||
          (!enableArgentWebWallet &&
            !lastWallet &&
            preAuthorizedWallets.length === 0 &&
            installedWallets.length === 0),
      )
      .map(({ downloads, ...w }) => ({
        ...w,
        download: downloads[storeVersion],
      }))

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  return show({
    chainId,
    webWalletUrl,
    projectId,
    dappName,
    enableArgentWebWallet,
    enableArgentMobile,
    lastWallet,
    preAuthorizedWallets,
    installedWallets,
    discoveryWallets: discoveryWalletsByStoreVersion,
    enable: enableWithVersion,
    modalOptions: {
      theme: modalTheme,
      starknetAppearance: isSafari ? "all" : modalWalletAppearance,
    },
  })
}

export function disconnect(options: DisconnectOptions = {}): Promise<void> {
  return sn.disconnect(options)
}
