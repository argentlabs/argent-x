import { assertNever } from "./../ui/services/assertNever"
import type { WindowMessageType } from "../shared/messages"
import { getProvider } from "../shared/network/provider"
import { disconnectAccount } from "./account"
import { ArgentXAccount } from "./ArgentXAccount"
import { getIsPreauthorized } from "./preAuthorization"
import { starknetWindowObject, userEventHandlers } from "./starknetWindowObject"

function attach() {
  try {
    delete window.starknet
    // set read only property to window
    Object.defineProperty(window, "starknet", {
      value: starknetWindowObject,
      writable: false,
    })
  } catch {
    // ignore
  }
  // we need 2 different try catch blocks because we want to execute both even if one of them fails
  try {
    window.starknet = starknetWindowObject
  } catch {
    // ignore
  }
}

function attachHandler() {
  attach()
  setTimeout(attach, 100)
}
// inject script
attachHandler()
window.addEventListener("load", () => attachHandler())
document.addEventListener("DOMContentLoaded", () => attachHandler())
document.addEventListener("readystatechange", () => attachHandler())

window.addEventListener(
  "message",
  async ({ data }: MessageEvent<WindowMessageType>) => {
    const { starknet } = window
    if (!starknet) {
      return
    }

    if (starknet.account && data.type === "CONNECT_ACCOUNT") {
      const { address, network } = data.data
      const isPreauthorized = await getIsPreauthorized()
      if (!isPreauthorized) {
        // disconnect so the user can see they are no longer connected
        // TODO: better UX would be to also re-connect when user selects pre-authorized account
        await disconnectAccount()
      } else {
        if (address !== starknet.selectedAddress) {
          starknet.selectedAddress = address
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
