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
import type { WalletMessenger } from "./messages"

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
  messenger: WalletMessenger,
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
    account: new MessageAccount(messenger, provider, walletAddress),
    provider,
  }

  return Object.assign(windowObject, valuesToAssign)
}

export const getArgentStarknetWindowObject = (
  options: GetArgentStarknetWindowObject,
  messenger: WalletMessenger,
  provider: ProviderInterface,
): StarknetWindowObject => {
  const wallet: StarknetWindowObject = {
    ...options,
    isConnected: false,
    provider,
    async request(call) {
      switch (call.type) {
        case "wallet_addStarknetChain": {
          const params = call.params as AddStarknetChainParameters
          const receiptPromise = messenger.listenMessage(
            "ADD_STARKNET_CHAIN_REQUEST_RECEIPT",
          )
          messenger.postMessage({
            type: "ADD_STARKNET_CHAIN_REQUEST",
            data: params,
          })
          const receipt = await receiptPromise
          const dataOrError = await Promise.race([
            messenger.listenMessage(
              "ADD_STARKNET_CHAIN_RESPONSE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
            messenger.listenMessage(
              "ADD_STARKNET_CHAIN_FAILURE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
          ])

          if ("error" in dataOrError) {
            throw Error(dataOrError.error)
          }

          return dataOrError.success
        }
        case "wallet_switchStarknetChain": {
          const params = call.params as SwitchStarknetChainParameter
          const receiptPromise = messenger.listenMessage(
            "SWITCH_STARKNET_CHAIN_REQUEST_RECEIPT",
          )
          messenger.postMessage({
            type: "SWITCH_STARKNET_CHAIN_REQUEST",
            data: params,
          })
          const receipt = await receiptPromise
          const dataOrError = await Promise.race([
            messenger.listenMessage(
              "SWITCH_STARKNET_CHAIN_RESPONSE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
            messenger.listenMessage(
              "SWITCH_STARKNET_CHAIN_FAILURE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
          ])

          if ("error" in dataOrError) {
            throw Error(dataOrError.error)
          }

          return dataOrError.success
        }
        case "wallet_watchAsset": {
          const params = call.params as WatchAssetParameters
          const receiptPromise = messenger.listenMessage(
            "WATCH_ASSET_REQUEST_RECEIPT",
          )
          messenger.postMessage({
            type: "WATCH_ASSET_REQUEST",
            data: params,
          })
          const receipt = await receiptPromise
          const dataOrError = await Promise.race([
            messenger.listenMessage(
              "WATCH_ASSET_RESPONSE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
            messenger.listenMessage(
              "WATCH_ASSET_FAILURE",
              (message) => message.meta.forReceiptId === receipt.receiptId,
            ),
          ])

          if ("error" in dataOrError) {
            throw Error(dataOrError.error)
          }

          return dataOrError.success
        }
        default:
          throw new Error("not implemented")
      }
    },
    async enable(ops) {
      if (ops?.starknetVersion === "v3") {
        throw Error("not implemented")
      }
      const receiptPromise = messenger.listenMessage("CONNECT_REQUEST_RECEIPT")
      messenger.postMessage({
        type: "CONNECT_REQUEST",
        data: {
          host: options.host,
        },
      })
      const receipt = await receiptPromise
      const dataOrError = await Promise.race([
        messenger.listenMessage(
          "CONNECT_RESPONSE",
          (message) => message.meta.forReceiptId === receipt.receiptId,
        ),
        messenger.listenMessage(
          "CONNECT_FAILURE",
          (message) => message.meta.forReceiptId === receipt.receiptId,
        ),
      ])

      if ("error" in dataOrError) {
        throw Error(dataOrError.error)
      }

      updateStarknetWindowObject(
        wallet,
        provider,
        messenger,
        dataOrError.selectedAddress,
      )

      return [dataOrError.selectedAddress]
    },
    async isPreauthorized() {
      const receiptPromise = messenger.listenMessage(
        "IS_PREAUTHORIZED_RESPONSE",
      )
      messenger.postMessage({
        type: "IS_PREAUTHORIZED_REQUEST",
        data: {
          host: options.host,
        },
      })

      const { isPreauthorized } = await receiptPromise
      return isPreauthorized
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
