import {
  MessageExchange,
  MethodsToImplementations,
  StarknetMethods,
  WebWalletMethods,
  WindowMessenger,
} from "@argent/x-window"
import mitt from "mitt"
import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"
import useSwr from "swr"

import { encodeTransactions } from "../pages/dashboard"
import { retrieveAccountFromSession } from "../services/account"
import { usePreAuthorized } from "../states/preAuthorized"
import { useAccount, useBackendAccount } from "./account"

export const listenForRefresh = (fn: () => Promise<void>) => {
  const bc = new BroadcastChannel("refresh")
  const handler = async (e: MessageEvent) => {
    if (e.data === "refresh") {
      await fn()
      bc.postMessage("refresh_done")
    }
  }
  bc.addEventListener("message", handler)
  return () => bc.removeEventListener("message", handler)
}

export const triggerRefresh = () => {
  const bc = new BroadcastChannel("refresh")
  bc.postMessage("refresh")
  return new Promise<void>((resolve) => {
    const handler = (e: MessageEvent) => {
      if (e.data === "refresh_done") {
        // wait for 500ms to make sure the page was refreshed in every tab
        setTimeout(() => {
          resolve()
        }, 500)
      }
    }
    bc.addEventListener("message", handler, { once: true })
  })
}

type ActionEvents = {
  enable: { success: boolean }
  execute:
    | {
        success: false
      }
    | {
        success: true
        txHash: string
      }
  signMessage:
    | {
        success: false
      }
    | {
        success: true
        signature: string[]
      }
}
export const actionEmitter = mitt<ActionEvents>()
function waitForAction<T extends keyof ActionEvents>(action: T) {
  return new Promise<ActionEvents[T]>((resolve) => {
    actionEmitter.on(action, resolve)
  })
}

export const useLocalHandle = () => {
  const router = useRouter()
  const { mutate: getAccount } = useAccount()
  const { mutate: getBeAccount } = useBackendAccount()
  const { isPreAuthorized } = usePreAuthorized()

  const localHandleImplementation = useCallback(async () => {
    const messageTarget: Window = window.opener ?? window.parent
    const messenger = new WindowMessenger({
      postWindow: messageTarget,
      postOrigin: "*",
      listenWindow: window,
    })
    return new MessageExchange<
      WebWalletMethods,
      MethodsToImplementations<StarknetMethods>
    >(messenger, {
      async enable([options], origin) {
        const account = await getAccount()
        console.log("enable", options, origin, account)
        if (options?.starknetVersion === "v3") {
          throw Error("not implemented")
        }
        if (!account) {
          throw Error("not logged in")
        }
        if (isPreAuthorized(origin)) {
          console.log("preauthorized")
          return [account.address]
        }
        router.push(`/connect?origin=${encodeURIComponent(origin)}`, "/connect")
        console.log("waiting for action")
        const { success } = await waitForAction("enable")
        console.log("enable", success)
        if (!success) {
          throw Error("User rejected")
        }
        return [account.address]
      },
      async getLoginStatus() {
        const beAccount = await getBeAccount
        const account = await getAccount()
        if (!beAccount) {
          return { isLoggedIn: false }
        }

        return {
          isLoggedIn: true,
          hasSession: !!account,
          isPreauthorized: isPreAuthorized(origin),
        }
      },
      async execute([transactions, abis, transactionsDetail]) {
        const txs = Array.isArray(transactions) ? transactions : [transactions]
        router.push(
          `/review?transactions=${encodeTransactions(txs)}`,
          "/review",
        )
        const result = await waitForAction("execute")
        if (!result.success) {
          throw Error("User rejected")
        }
        return {
          transaction_hash: result.txHash,
        }
      },
      async signMessage(typedData) {
        const result = await waitForAction("signMessage")
        if (!result.success) {
          throw Error("User rejected")
        }
        return result.signature
      },
      addStarknetChain(params) {
        throw Error("not implemented")
      },
      switchStarknetChain(params) {
        throw Error("not implemented")
      },
      watchAsset(params) {
        throw Error("not implemented")
      },
    })
  }, [getBeAccount, getAccount, isPreAuthorized, router])

  const { data } = useSwr(`localHandle`, localHandleImplementation, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    onError: (e) => {
      console.error("Failed to connect to parent window", e)
    },
  })
  return data
}

export const useAccountMessageHandler = () => {
  const { mutate: accountMutate } = useAccount()

  useEffect(() => {
    return listenForRefresh(async () => {
      await retrieveAccountFromSession().catch(() => {})
      await accountMutate()
    })
  }, [accountMutate])
}
