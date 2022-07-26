import { defaultProvider } from "starknet"

import { assertNever } from "./../ui/services/assertNever"
import type { WindowMessageType } from "../shared/messages"
import { getProvider } from "../shared/network/provider"
import { ArgentXAccount } from "./ArgentXAccount"
import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "./inpage.model"
import { sendMessage } from "./messageActions"
import { getIsPreauthorized } from "./preAuthorization"
import {
  handleAddNetworkRequest,
  handleAddTokenRequest,
  handleSwitchNetworkRequest,
} from "./requestMessageHandlers"

const VERSION = `${process.env.VERSION}`

export const userEventHandlers: WalletEvents[] = []

// window.ethereum like
export const starknetWindowObject: StarknetWindowObject = {
  id: "argent-x",
  account: undefined,
  provider: defaultProvider,
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
  enable: () =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { starknet } = window
        if (!starknet) {
          return
        }

        if (
          (data.type === "CONNECT_DAPP_RES" && data.data) ||
          (data.type === "START_SESSION_RES" && data.data)
        ) {
          window.removeEventListener("message", handleMessage)
          const { address, network } = data.data
          starknet.provider = getProvider(network)
          starknet.account = new ArgentXAccount(address, starknet.provider)
          starknet.selectedAddress = address
          starknet.chainId = network.chainId
          starknet.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({
        type: "CONNECT_DAPP",
        data: { host: window.location.host },
      })
    }),
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
