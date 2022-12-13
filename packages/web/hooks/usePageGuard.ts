import { NextRouter, useRouter } from "next/router"
import { useCallback, useEffect } from "react"

import {
  getAccount as getMemoryAccount,
  retrieveAccountFromSession,
} from "../services/account"
import { UserAccount } from "../services/backend/account"
import { useAccount, useBackendAccount } from "./account"
import { useLocalHandle } from "./useMessages"

const allowedDestinations = {
  "/email": ["/email", "/pin"],
  "/password": [
    "/password",
    "/pin",
    "/new-password",
    "/forgot-password",
    "/forgot-password/wait",
    "/forgot-password/finish",
  ],
  "/new-password": ["/new-password"],
  "/dashboard": ["/dashboard", "/review", "/connect"],
}

const shouldShowIframe = ["/review", "/connect"]

const conditionallyPushTo = (
  router: NextRouter,
  destination: keyof typeof allowedDestinations,
  urlParams?: Record<string, string>,
) => {
  console.log("conditionallyPushTo", destination, urlParams)
  const allowed = allowedDestinations[destination]
  if (!allowed.includes(router.pathname ?? router.asPath)) {
    return router.push(
      `${destination}?${new URLSearchParams(urlParams)}`,
      destination,
    )
  }
}

export const usePageGuard = () => {
  const router = useRouter()
  const { mutate: refreshAccount } = useAccount()
  const localHandle = useLocalHandle()

  const handleAccountSuccess = useCallback(
    async (account: UserAccount) => {
      if (account.accounts[0]) {
        if (
          (await getMemoryAccount()) ||
          (await retrieveAccountFromSession(account.accounts[0])
            .then(() => refreshAccount())
            .catch(() => false))
        ) {
          await conditionallyPushTo(router, "/dashboard")
        } else {
          await conditionallyPushTo(router, "/password", {
            email: account.email,
          })
        }
      } else {
        await conditionallyPushTo(router, "/new-password", {
          email: account.email,
        })
      }
    },
    [refreshAccount, router],
  )
  const handleAccountError = useCallback(async () => {
    return conditionallyPushTo(router, "/email")
  }, [router])

  const { account, error } = useBackendAccount()

  useEffect(() => {
    if (account) {
      handleAccountSuccess(account)
    } else if (error) {
      handleAccountError()
    }
  }, [account, error, handleAccountError, handleAccountSuccess])

  // revaildate navigation guard without refetching account
  const routeChangeHandler = useCallback(() => {
    console.log("route change", account, error)
    if (account) {
      handleAccountSuccess(account)
    } else if (error) {
      handleAccountError()
    }
  }, [account, error, handleAccountError, handleAccountSuccess])
  useEffect(() => {
    router.events.on("routeChangeComplete", routeChangeHandler)
    return () => {
      router.events.off("routeChangeComplete", routeChangeHandler)
    }
  }, [routeChangeHandler, router.events])

  // emits messages to the parent window when shown to communicate the current height
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const newHeight = entries[0].target.clientHeight
      if (localHandle && newHeight) {
        localHandle.call("heightChanged", newHeight)
      }
    })

    const handler = (url: string) => {
      if (localHandle) {
        const [pathname] = url.split("?")
        if (shouldShowIframe.includes(pathname)) {
          localHandle.call("shouldShow")
          observer.observe(window.document.body)
        } else {
          localHandle.call("shouldHide")
          observer.disconnect()
        }
      }
      return true
    }

    router.events.on("routeChangeComplete", handler)
    return () => {
      router.events.off("routeChangeComplete", handler)
    }
  }, [localHandle, router])
}
