import { assertNever } from "../shared/utils/assertNever"
import type { WindowMessageType } from "../shared/messages"
import { getProvider } from "../shared/network/provider"
import { disconnectAccount } from "./account"
import { ArgentXAccount } from "./ArgentXAccount"
import { starknetWindowObject, userEventHandlers } from "./starknetWindowObject"
import { shortString } from "starknet"
import { isArgentNetwork } from "../shared/network/utils"
import { inpageMessageClient } from "./trpcClient"
import { WalletAccount } from "../shared/wallet.model"
import { BackwardsCompatibleStarknetWindowObject } from "starknetkit/window"

const INJECT_NAMES = ["starknet", "starknet_argentX"]

function attach() {
  INJECT_NAMES.forEach((name) => {
    // we need 2 different try catch blocks because we want to execute both even if one of them fails
    try {
      delete (window as any)[name]
    } catch (e) {
      // ignore
    }
    try {
      // set read only property to window
      Object.defineProperty(window, name, {
        value: starknetWindowObject,
        writable: false,
      })
    } catch {
      // ignore
    }
    try {
      ;(window as any)[name] = starknetWindowObject
    } catch {
      // ignore
    }
  })
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

const handleConnect = async (account: WalletAccount, silent: boolean) => {
  const starknet = window.starknet as BackwardsCompatibleStarknetWindowObject
  const walletAccount =
    await inpageMessageClient.dappMessaging.connectDapp.mutate({
      origin: window.location.origin,
      silent,
    })

  if (!walletAccount) {
    return disconnectAccount()
  }

  const { address, network } = account
  const provider = getProvider(network)

  starknet.selectedAddress = address
  starknet.chainId = network.chainId

  starknet.provider = provider
  starknet.account = new ArgentXAccount(address, provider)
  for (const userEvent of userEventHandlers) {
    if (userEvent.type === "accountsChanged") {
      userEvent.handler([address])
    } else if (userEvent.type === "networkChanged") {
      const chainId = isArgentNetwork(network)
        ? shortString.encodeShortString(network.chainId)
        : network.chainId
      userEvent.handler(chainId as any, [address])
    } else {
      assertNever(userEvent)
    }
  }
}

window.addEventListener(
  "message",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async ({ data }: MessageEvent<WindowMessageType>) => {
    if (!window.starknet) {
      return
    }

    const starknet = window.starknet as BackwardsCompatibleStarknetWindowObject

    if (
      data.type === "CONNECT_ACCOUNT_RES" ||
      data.type === "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
    ) {
      const account =
        data.type === "CONNECT_ACCOUNT_RES"
          ? data.data
          : data.data.selectedAccount

      if (
        account &&
        (account.address !== starknet.selectedAddress ||
          account.network.chainId !== starknet.chainId)
      ) {
        void handleConnect(account, false)
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
