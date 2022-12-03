import mitt from "mitt"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { encodeTransactions } from "../pages/dashboard"
import { retrieveAccountFromSession } from "../services/account"
import { usePreAuthorized } from "../states/preAuthorized"
import { useAccount, useBackendAccount } from "./account"
import { useLocalHandle } from "./usePageGuard"

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

export const useAccountMessageHandler = () => {
  const router = useRouter()
  const localHandle = useLocalHandle()
  const { account, mutate: accountMutate } = useAccount()
  const { account: beAccount } = useBackendAccount()
  const { isPreAuthorized } = usePreAuthorized()

  useEffect(() => {
    return listenForRefresh(async () => {
      await retrieveAccountFromSession().catch(() => {})
      await accountMutate()
    })
  }, [accountMutate])

  useEffect(() => {
    if (!localHandle) {
      console.warn("No local handle")
      return
    }
    const origin = "http://localhost:3000"

    localHandle.setMethods({
      async enable(options) {
        if (options?.starknetVersion === "v3") {
          throw Error("not implemented")
        }
        if (!account) {
          throw Error("not logged in")
        }
        if (isPreAuthorized(origin)) {
          return [account.address]
        }
        router.push(`/connect?origin=${encodeURIComponent(origin)}`, "/connect")
        const { success } = await waitForAction("enable")
        console.log("enable", success)
        if (!success) {
          throw Error("User rejected")
        }
        return [account.address]
      },
      async getLoginStatus() {
        if (!beAccount) {
          return { isLoggedIn: false }
        }

        return {
          isLoggedIn: true,
          hasSession: !!account,
          isPreauthorized: isPreAuthorized(origin),
        }
      },
      async execute(transactions, abis, transactionsDetail) {
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
  }, [localHandle, account, router, accountMutate, beAccount, isPreAuthorized])
}
