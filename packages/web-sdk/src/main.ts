import { getArgentStarknetWindowObject } from "@argent/x-window"
import type { WebWalletStarknetWindowObject } from "@argent/x-window"
import memo from "lodash-es/memoize"
import { SequencerProvider } from "starknet"

import { createModal, getConnection } from "./wormhole"

type NetworkName = "mainnet-alpha" | "goerli-alpha" | "goerli-alpha-2"
const DEVELOPMENT_NETWORK: NetworkName = "goerli-alpha"
/**
 * Map a target URL to a network ID
 * https://web.dev.argent47.net -> goerli-alpha-2
 * https://web.hydrogen.argent47.net -> goerli-alpha
 * https://web.staging.argent47.net -> mainnet-alpha
 * https://web.argent.xyz -> mainnet-alpha
 */
function mapTargetUrlToNetworkId(target: string): NetworkName {
  try {
    const { origin } = new URL(target)
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return DEVELOPMENT_NETWORK
    }
    if (origin.includes("hydrogen")) {
      return "goerli-alpha"
    }
    if (origin.includes("staging")) {
      return "mainnet-alpha"
    }
    if (origin.includes("dev")) {
      return "goerli-alpha-2"
    }
    if (origin.includes("argent.xyz")) {
      return "mainnet-alpha"
    }
  } catch (e) {
    console.warn(
      "Could not determine network from target URL, defaulting to mainnet-alpha",
    )
  }
  return "mainnet-alpha"
}

export const getWebWalletStarknetObject = memo(
  async (
    target: string,
    popup?: Window,
  ): Promise<WebWalletStarknetWindowObject> => {
    const globalWindow = typeof window !== "undefined" ? window : undefined
    if (!globalWindow) {
      throw new Error("window is not defined")
    }

    let starknetWindowObject: WebWalletStarknetWindowObject
    const network = mapTargetUrlToNetworkId(target)
    const defaultProvider = new SequencerProvider({ network })
    if (popup) {
      starknetWindowObject = getArgentStarknetWindowObject(
        {
          host: globalWindow.location.origin,
          id: "argentWebWallet",
          icon: "https://www.argent.xyz/favicon.ico",
          name: "Argent Web Wallet",
          version: "1.0.0",
        },
        defaultProvider,
        await getConnection({ popup }, target),
      )
    } else {
      const { iframe, modal } = await createModal(target, false)
      starknetWindowObject = getArgentStarknetWindowObject(
        {
          host: globalWindow.location.origin,
          id: "argentWebWallet",
          icon: "https://www.argent.xyz/favicon.ico",
          name: "Argent Web Wallet",
          version: "1.0.0",
        },
        defaultProvider,
        await getConnection({ iframe, modal }),
      )
    }

    return starknetWindowObject
  },
  (target, popup) => `${target}-${popup ? "popup" : "iframe"}`,
)
