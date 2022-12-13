import { getArgentStarknetWindowObject } from "@argent/x-window"
import type { StarknetWindowObject } from "get-starknet-core"
import memo from "lodash-es/memoize"
import { SequencerProvider } from "starknet"

import { createModal, getConnection } from "./wormhole"

const ORIGIN = "http://localhost:3005"
const TARGET = `${ORIGIN}/`
const DEFAULT_NETWORK = "goerli-alpha-2" as const

export const getWebWalletStarknetObject = memo(
  async (): Promise<StarknetWindowObject> => {
    const globalWindow = typeof window !== "undefined" ? window : undefined
    if (!globalWindow) {
      throw new Error("window is not defined")
    }

    const { iframe, modal } = await createModal(TARGET, false)

    const connection = await getConnection({ iframe, modal })

    const defaultProvider = new SequencerProvider({ network: DEFAULT_NETWORK })
    const starknetWindowObject = getArgentStarknetWindowObject(
      {
        host: globalWindow.location.origin,
        id: "argentWebWallet",
        icon: "https://www.argent.xyz/favicon.ico",
        name: "Argent Web Wallet",
        version: "1.0.0",
      },
      defaultProvider,
      connection,
    )

    return starknetWindowObject
  },
)
