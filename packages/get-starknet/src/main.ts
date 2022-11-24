import Bowser from "bowser"
import type {
  DisconnectOptions,
  GetWalletOptions,
  StarknetWindowObject,
} from "get-starknet-core"
import sn from "get-starknet-core"

import type { WalletProviderWithStoreVersion } from "./modal"
import show from "./modal"

export type { StarknetWindowObject, DisconnectOptions } from "get-starknet-core"

type StoreVersion = "chrome" | "firefox" | "edge"

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
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  storeVersion?: StoreVersion
  alwaysShowDiscovery?: boolean
}

const enableWithVersion = async (wallet: StarknetWindowObject | null) => {
  if (!wallet) {
    return null
  }
  return sn.enable(wallet, { starknetVersion: "v4" }).catch(() => null)
}

export const connect = async ({
  modalMode = "canAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  alwaysShowDiscovery = false,
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

  const discoveryWallets = await sn.getDiscoveryWallets(restOptions)

  const discoveryWalletsByStoreVersion: WalletProviderWithStoreVersion[] =
    discoveryWallets
      .filter((w) => Boolean(w.downloads[storeVersion]))
      .filter(
        // if alwaysShowDiscovery=false: only show discovery wallets if there are no other options
        () =>
          alwaysShowDiscovery ||
          (!lastWallet &&
            preAuthorizedWallets.length === 0 &&
            installedWallets.length === 0),
      )
      .map(({ downloads, ...w }) => ({
        ...w,
        download: downloads[storeVersion],
      }))

  return show({
    lastWallet,
    preAuthorizedWallets,
    installedWallets,
    discoveryWallets: discoveryWalletsByStoreVersion,
    enable: enableWithVersion,
    modalOptions: {
      theme: modalTheme,
    },
  })
}

export function disconnect(options: DisconnectOptions = {}): Promise<void> {
  return sn.disconnect(options)
}
