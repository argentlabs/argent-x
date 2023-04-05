import type { StarknetWindowObject } from "@argent/x-window"
import { assertNever } from "./../ui/services/assertNever"
import type { WindowMessageType } from "../shared/messages"
import { getProvider } from "../shared/network/provider"
import { disconnectAccount } from "./account"
import { ArgentXAccount } from "./ArgentXAccount"
import { sendMessage, waitForMessage } from "./messageActions"
import { getIsPreauthorized } from "./messaging"
import { starknetWindowObject, userEventHandlers } from "./starknetWindowObject"
import { isPlainObject } from "lodash-es"

const INJECT_NAMES = ["starknet", "starknet_argentX"]

function attach() {
  window.starknetProviders =
    window.starknetProviders && isPlainObject(window.starknetProviders) ? window.starknetProviders : {}

  INJECT_NAMES.forEach((name) => {
    // we need 2 different try catch blocks because we want to execute both even if one of them fails
    try {
      delete (window.starknetProviders as any)[name]
    } catch (e) {
      // ignore
    }
    try {
      // set read only property to window
      Object.defineProperty(window.starknetProviders, name, {
        value: starknetWindowObject,
        writable: false,
      })
    } catch {
      // ignore
    }
    try {
      ;(window.starknetProviders as any)[name] = starknetWindowObject
      window.dispatchEvent(new Event(`starknet/${name}#initialized`)) // dApps could subscribe this event to detect whether the window object is available
    } catch {
      // ignore
    }
  })
}

function attachHandler() {
  attach()
  // setTimeout(attach, 100) // no need to wait due to `initialized` event
}
// inject script
attachHandler()

window.addEventListener(
  "message",
  async ({ data }: MessageEvent<WindowMessageType>) => {
    const { starknet } = window
    if (!starknet) {
      return
    }

    if (
      (starknet.account && data.type === "CONNECT_ACCOUNT_RES") ||
      data.type === "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
    ) {
      const account =
        data.type === "CONNECT_ACCOUNT_RES"
          ? data.data
          : data.data.selectedAccount

      const isPreauthorized = await getIsPreauthorized()
      if (!isPreauthorized) {
        // disconnect so the user can see they are no longer connected
        // TODO: better UX would be to also re-connect when user selects pre-authorized account
        await disconnectAccount()
      } else {
        const walletAccountP = waitForMessage(
          "CONNECT_DAPP_RES",
          10 * 60 * 1000,
        )
        sendMessage({
          type: "ARGENT_CONNECT_DAPP",
        })
        const walletAccount = await walletAccountP

        if (!walletAccount) {
          return disconnectAccount()
        }

        if (
          account &&
          (account.address !== starknet.selectedAddress ||
            account.network.chainId !== starknet.chainId)
        ) {
          const { address, network } = account

          starknet.selectedAddress = address
          starknet.chainId = network.chainId
          starknet.provider = getProvider(network)
          starknet.account = new ArgentXAccount(address, starknet.provider)
          for (const userEvent of userEventHandlers) {
            if (userEvent.type === "accountsChanged") {
              userEvent.handler([address])
            } else if (userEvent.type === "networkChanged") {
              userEvent.handler(network.chainId)
            } else {
              assertNever(userEvent)
            }
          }
        }
      }
    } else if (data.type === "DISCONNECT_ACCOUNT") {
      starknet.selectedAddress = undefined
      starknet.account = undefined
      starknet.isConnected = false
      for (const userEvent of userEventHandlers) {
        if (userEvent.type === "accountsChanged") {
          userEvent.handler([])
        } else if (userEvent.type === "networkChanged") {
          userEvent.handler(undefined)
        } else {
          assertNever(userEvent)
        }
      }
    }
  },
)

declare global {
  interface Window {
    // Inspired by EIP-5749: https://eips.ethereum.org/EIPS/eip-5749
    starknetProviders?: Record<string, StarknetWindowObject>
  }
}
