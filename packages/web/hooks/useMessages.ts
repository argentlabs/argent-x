import mitt from "mitt"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { encodeTransactions } from "../pages/dashboard"
import { retrieveAccountFromSession } from "../services/account"
import { getAccount } from "../services/backend/account"
import { useAccount } from "./account"
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

export const useAccountMessageHandler = () => {
  const router = useRouter()
  const localHandle = useLocalHandle()
  const { account, mutate } = useAccount()

  useEffect(() => {
    if (!localHandle) {
      console.warn("No local handle")
      return
    }

    localHandle.setMethods({
      async enable(options) {
        if (options?.starknetVersion === "v3") {
          throw Error("not implemented")
        }
        if (!account) {
          throw Error("not logged in")
        }
        // const { success } = await waitForAction("enable")
        // if (!success) {
        //   throw Error("User rejected")
        // }
        return [account.address]
      },
      async isPreauthorized() {
        return true
      },
      async getLoginStatus() {
        try {
          const beAccount = await getAccount()
          return {
            isLoggedIn: true,
            email: beAccount.email,
            hasSession: Boolean(account),
          }
        } catch (e) {
          return { isLoggedIn: false }
        }
      },
      async reloadData() {
        await retrieveAccountFromSession().catch(() => {})
        await mutate()
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
  }, [localHandle, account, router])
}
