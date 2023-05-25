import type {
  AccountChangeEventHandler,
  AddStarknetChainParameters,
  ConnectedStarknetWindowObject,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  SwitchStarknetChainParameter,
  WatchAssetParameters,
} from "get-starknet-core"
import type { ProviderInterface } from "starknet"

import { MessageAccount } from "./account"
import { userEventHandlers } from "./eventHandlers"
import { Sender } from "./messages/exchange/bidirectional"
import { StarknetMethods } from "./types"

export type Variant = "argentX" | "argentWebWallet"

export interface GetArgentStarknetWindowObject {
  id: Variant
  icon: string
  name: string
  version: string
  host: string
}

function updateStarknetWindowObject(
  windowObject: StarknetWindowObject,
  provider: ProviderInterface,
  remoteHandle: Sender<StarknetMethods>,
  walletAddress: string,
): ConnectedStarknetWindowObject {
  if (windowObject.isConnected) {
    return windowObject
  }

  const valuesToAssign: Pick<
    ConnectedStarknetWindowObject,
    "isConnected" | "chainId" | "selectedAddress" | "account" | "provider"
  > = {
    isConnected: true,
    chainId: provider.chainId,
    selectedAddress: walletAddress,
    account: new MessageAccount(provider, walletAddress, remoteHandle),
    provider,
  }

  return Object.assign(windowObject, valuesToAssign)
}

export type WebWalletStarknetWindowObject = StarknetWindowObject & {
  getLoginStatus(): Promise<
    | {
        isLoggedIn: false
      }
    | {
        isLoggedIn: true
        hasSession: boolean
        isPreauthorized: boolean
      }
  >
}

export const getArgentStarknetWindowObject = (
  options: GetArgentStarknetWindowObject,
  provider: ProviderInterface,
  remoteHandle: Sender<StarknetMethods>,
): WebWalletStarknetWindowObject => {
  const wallet: WebWalletStarknetWindowObject = {
    ...options,
    isConnected: false,
    provider,
    getLoginStatus: () => remoteHandle.call("getLoginStatus"),
    async request(call) {
      switch (call.type) {
        case "wallet_addStarknetChain": {
          const params = call.params as AddStarknetChainParameters
          return remoteHandle.call("addStarknetChain", params)
        }
        case "wallet_switchStarknetChain": {
          const params = call.params as SwitchStarknetChainParameter
          return remoteHandle.call("switchStarknetChain", params)
        }
        case "wallet_watchAsset": {
          const params = call.params as WatchAssetParameters
          return remoteHandle.call("watchAsset", params)
        }
        default:
          throw new Error("not implemented")
      }
    },
    async enable(ops) {
      if (ops?.starknetVersion !== "v4") {
        throw Error("not implemented")
      }
      const [selectedAddress] = await remoteHandle.call("enable")
      updateStarknetWindowObject(
        wallet,
        provider,
        remoteHandle,
        selectedAddress,
      )

      return [selectedAddress]
    },
    async isPreauthorized() {
      const loginStatus = await remoteHandle.call("getLoginStatus")
      return loginStatus.isLoggedIn && loginStatus.isPreauthorized
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
        throw new Error(`Unknwown event: ${event}`)
      }
    },
    off: (event, handleEvent) => {
      if (event !== "accountsChanged" && event !== "networkChanged") {
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

  // TODO: handle network and account changes

  return wallet
}
