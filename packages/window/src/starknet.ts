import type {
  AccountChangeEventHandler,
  AddStarknetChainParameters,
  NetworkChangeEventHandler,
  SwitchStarknetChainParameters,
  WatchAssetParameters,
  RequestAccountsParameters,
  StarknetWindowObject,
} from "get-starknet-core"

import {
  IStarknetWindowObject as IStarknetWindowObjectV3,
  ConnectedStarknetWindowObject as ConnectedStarknetWindowObjectV3,
} from "get-starknet-coreV3"
import type { ProviderInterface } from "starknet"
import type { ProviderInterface as ProviderInterface5 } from "starknet5"
import type { ProviderInterface as ProviderInterface4 } from "starknet4"

import type { AccountInterface } from "starknet"
import type { AccountInterface as AccountInterface5 } from "starknet5"
import type { AccountInterface as AccountInterface4 } from "starknet4"

import { MessageAccount } from "./account"
import { userEventHandlers } from "./eventHandlers"
import { Sender } from "./messages/exchange/bidirectional"
import { StarknetMethods } from "./types"

type CommonOmittedProperties =
  | "on"
  | "off"
  | "request"
  | "icon"
  | "provider"
  | "account"

export type BackwardsCompatibleStarknetWindowObject = Omit<
  StarknetWindowObject,
  "provider" | "account"
> &
  Omit<IStarknetWindowObjectV3, CommonOmittedProperties> & {
    isConnected?: boolean
  } & {
    provider?: ProviderInterface | ProviderInterface5 | ProviderInterface4
    account?: AccountInterface | AccountInterface5 | AccountInterface4
  }

export type BackwardsCompatibleConnectedStarknetWindowObject = Omit<
  StarknetWindowObject,
  "provider" | "account"
> &
  Omit<ConnectedStarknetWindowObjectV3, CommonOmittedProperties> & {
    provider?: ProviderInterface | ProviderInterface5 | ProviderInterface4
    account?: AccountInterface | AccountInterface5 | AccountInterface4
  }

export type Variant = "argentX" | "argentWebWallet"

export interface GetArgentStarknetWindowObject {
  id: Variant
  icon: string
  name: string
  version: string
  host: string
}

async function updateStarknetWindowObject(
  windowObject: BackwardsCompatibleStarknetWindowObject,
  provider: ProviderInterface,
  remoteHandle: Sender<StarknetMethods>,
  walletAddress: string,
): Promise<BackwardsCompatibleConnectedStarknetWindowObject> {
  if (windowObject.isConnected && windowObject.account) {
    return windowObject as BackwardsCompatibleConnectedStarknetWindowObject
  }

  const valuesToAssign: Pick<
    BackwardsCompatibleConnectedStarknetWindowObject,
    "isConnected" | "chainId" | "selectedAddress" | "account" | "provider"
  > = {
    isConnected: true,
    chainId: await provider.getChainId(),
    selectedAddress: walletAddress,
    account: new MessageAccount(provider, walletAddress, remoteHandle),
    provider,
  }

  return Object.assign(windowObject, valuesToAssign)
}

export type WebWalletStarknetWindowObject =
  BackwardsCompatibleStarknetWindowObject & {
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
    provider,
    getLoginStatus: () => remoteHandle.call("getLoginStatus"),
    async request(call) {
      if ("params" in call) {
        switch (call.type) {
          case "wallet_requestAccounts": {
            const params = call.params as RequestAccountsParameters
            return remoteHandle.call("requestAccounts", params)
          }
          case "wallet_watchAsset": {
            const params = call.params as WatchAssetParameters
            return remoteHandle.call("watchAsset", params)
          }
          case "wallet_addStarknetChain": {
            const params = call.params as AddStarknetChainParameters
            return remoteHandle.call("addStarknetChain", params)
          }
          case "wallet_switchStarknetChain": {
            const params = call.params as SwitchStarknetChainParameters
            return remoteHandle.call("switchStarknetChain", params)
          }
          case "wallet_addInvokeTransaction": {
            throw new Error("not implemented")
          }
          case "wallet_addDeclareTransaction":
          case "wallet_signTypedData": {
            throw new Error("not implemented")
          }
          default:
            throw new Error(`Unknown request type: ${call.type}`)
        }
      } else {
        switch (call.type) {
          case "wallet_getPermissions": {
            throw new Error("not implemented")
          }
          case "wallet_requestChainId": {
            throw new Error("not implemented")
          }
          case "wallet_deploymentData": {
            throw new Error("not implemented")
          }
          case "wallet_supportedSpecs": {
            throw new Error("not implemented")
          }
          default:
            throw new Error(`Unknown request type: ${call.type}`)
        }
      }
    },
    async enable(ops) {
      if (ops?.starknetVersion !== "v4") {
        throw Error("not implemented")
      }
      const [selectedAddress] = await remoteHandle.call("enable")
      await updateStarknetWindowObject(
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
