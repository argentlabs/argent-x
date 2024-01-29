import type { CreateTRPCProxyClient } from "@trpc/client"
import memo from "lodash-es/memoize"
import { SequencerProvider, constants } from "starknet"

import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"
import { trpcProxyClient } from "./trpc"
import type { AppRouter } from "./trpc"

const { NetworkName } = constants

// Using NetworkName as a value.
const Network: typeof NetworkName = NetworkName

const DEVELOPMENT_NETWORK = Network.SN_GOERLI

function mapTargetUrlToNetworkId(target: string): constants.NetworkName {
  try {
    const { origin } = new URL(target)
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return DEVELOPMENT_NETWORK
    }
    if (origin.includes("hydrogen") || origin.includes("dev")) {
      return Network.SN_GOERLI
    }
    if (origin.includes("staging")) {
      return Network.SN_MAIN
    }
    if (origin.includes("argent.xyz")) {
      return Network.SN_MAIN
    }
  } catch (e) {
    console.warn(
      "Could not determine network from target URL, defaulting to mainnet-alpha",
    )
  }
  return Network.SN_MAIN
}

export const getWebWalletStarknetObject = memo(
  async (
    target: string,
    proxyLink: CreateTRPCProxyClient<AppRouter>,
  ): Promise<WebWalletStarknetWindowObject> => {
    const globalWindow = typeof window !== "undefined" ? window : undefined
    if (!globalWindow) {
      throw new Error("window is not defined")
    }

    const network = mapTargetUrlToNetworkId(target)
    const defaultProvider = new SequencerProvider({ network })
    const starknetWindowObject = getArgentStarknetWindowObject(
      {
        host: globalWindow.location.origin,
        id: "argentWebWallet",
        icon: "https://www.argent.xyz/favicon.ico",
        name: "Argent Web Wallet",
        version: "1.0.0",
      },
      defaultProvider,
      proxyLink,
    )

    return starknetWindowObject
  },
  (target) => `${target}`,
)

export { trpcProxyClient }
