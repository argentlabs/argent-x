// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "@argent/x-window"

import { assertNever } from "./../ui/services/assertNever"
import { getProvider } from "../shared/network/provider"
import { ArgentXAccount } from "./ArgentXAccount"
import { ArgentXAccount3, getProvider3 } from "./ArgentXAccount3"
import { sendMessage, waitForMessage } from "./messageActions"
import { getIsPreauthorized } from "./messaging"
import {
  handleAddNetworkRequest,
  handleAddTokenRequest,
  handleSwitchNetworkRequest,
} from "./requestMessageHandlers"

const VERSION = `${process.env.VERSION}`

export const userEventHandlers: WalletEvents[] = []

// window.ethereum like
export const starknetWindowObject: StarknetWindowObject = {
  id: "argentX", // if ever changed you need to change it in get-starknet aswell
  name: "Argent X",
  icon: "data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjQwIiBoZWlnaHQ9IjM2IiB2aWV3Qm94PSIwIDAgNDAgMzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNC43NTgyIC0zLjk3MzY0ZS0wN0gxNC42MjM4QzE0LjI4NTEgLTMuOTczNjRlLTA3IDE0LjAxMzggMC4yODExNzggMTQuMDA2NCAwLjYzMDY4M0MxMy44MDE3IDEwLjQ1NDkgOC44MjIzNCAxOS43NzkyIDAuMjUxODkzIDI2LjM4MzdDLTAuMDIwMjA0NiAyNi41OTMzIC0wLjA4MjE5NDYgMjYuOTg3MiAwLjExNjczNCAyNy4yNzA5TDYuMDQ2MjMgMzUuNzM0QzYuMjQ3OTYgMzYuMDIyIDYuNjQwOTkgMzYuMDg3IDYuOTE3NjYgMzUuODc1NEMxMi4yNzY1IDMxLjc3MjggMTYuNTg2OSAyNi44MjM2IDE5LjY5MSAyMS4zMzhDMjIuNzk1MSAyNi44MjM2IDI3LjEwNTcgMzEuNzcyOCAzMi40NjQ2IDM1Ljg3NTRDMzIuNzQxIDM2LjA4NyAzMy4xMzQxIDM2LjAyMiAzMy4zMzYxIDM1LjczNEwzOS4yNjU2IDI3LjI3MDlDMzkuNDY0MiAyNi45ODcyIDM5LjQwMjIgMjYuNTkzMyAzOS4xMzA0IDI2LjM4MzdDMzAuNTU5NyAxOS43NzkyIDI1LjU4MDQgMTAuNDU0OSAyNS4zNzU5IDAuNjMwNjgzQzI1LjM2ODUgMC4yODExNzggMjUuMDk2OSAtMy45NzM2NGUtMDcgMjQuNzU4MiAtMy45NzM2NGUtMDdaIiBmaWxsPSIjRkY4NzVCIi8+Cjwvc3ZnPgo=",
  account: undefined,
  provider: undefined,
  selectedAddress: undefined,
  chainId: undefined,
  isConnected: false,
  version: VERSION,
  request: async (call) => {
    if (call.type === "wallet_watchAsset" && call.params.type === "ERC20") {
      return await handleAddTokenRequest(call.params)
    } else if (call.type === "wallet_addStarknetChain") {
      return await handleAddNetworkRequest(call.params)
    } else if (call.type === "wallet_switchStarknetChain") {
      return await handleSwitchNetworkRequest(call.params)
    }
    throw Error("Not implemented")
  },
  enable: async ({ starknetVersion = "v3" } = {}) => {
    const walletAccountP = Promise.race([
      waitForMessage("CONNECT_DAPP_RES", 10 * 60 * 1000),
      waitForMessage("REJECT_PREAUTHORIZATION", 10 * 60 * 1000).then(
        () => "USER_ABORTED" as const,
      ),
    ])
    sendMessage({
      type: "CONNECT_DAPP",
      data: { host: window.location.host },
    })
    const walletAccount = await walletAccountP

    if (!walletAccount) {
      throw Error("No wallet account (should not be possible)")
    }
    if (walletAccount === "USER_ABORTED") {
      throw Error("User aborted")
    }
    const { starknet } = window
    if (!starknet) {
      throw Error("No starknet object detected")
    }

    const { address, network } = walletAccount

    if (starknetVersion === "v4") {
      const provider = getProvider(network)
      starknet.starknetJsVersion = "v4"
      starknet.provider = provider
      starknet.account = new ArgentXAccount(address, provider)
    } else {
      const provider = getProvider3(network)
      starknet.starknetJsVersion = "v3"
      starknet.provider = provider
      starknet.account = new ArgentXAccount3(address, provider)
    }

    starknet.selectedAddress = address
    starknet.chainId = network.chainId
    starknet.isConnected = true

    return [address]
  },
  isPreauthorized: async () => {
    return getIsPreauthorized()
  },
  on: (event, handleEvent) => {
    if (event === "accountsChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as AccountChangeEventHandler,
      })
    } else if (event === "networkChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as NetworkChangeEventHandler,
      })
    } else {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }
  },
  off: (event, handleEvent) => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }

    const eventIndex = userEventHandlers.findIndex(
      (userEvent) =>
        userEvent.type === event && userEvent.handler === handleEvent,
    )

    if (eventIndex >= 0) {
      userEventHandlers.splice(eventIndex, 1)
    }
  },
}
