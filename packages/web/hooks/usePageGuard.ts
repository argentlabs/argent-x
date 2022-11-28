import { getLocalHandle } from "@argent/x-window"
import { NextRouter, useRouter } from "next/router"
import { useEffect } from "react"
import useSwr from "swr"

import {
  getAccount as getMemoryAccount,
  retrieveAccountFromSession,
} from "../services/account"
import { useBackendAccount } from "./account"

const allowedDestinations = {
  "/email": ["/email", "/pin"],
  "/password": ["/password"],
  "/new-password": ["/new-password"],
  "/dashboard": ["/dashboard", "/review"],
}

const shouldShowIframe = ["/review"]

const conditionallyPushTo = (
  router: NextRouter,
  destination: keyof typeof allowedDestinations,
  urlParams?: Record<string, string>,
) => {
  const allowed = allowedDestinations[destination]
  if (!allowed.includes(router.pathname ?? router.asPath)) {
    return router.push(
      `${destination}?${new URLSearchParams(urlParams)}`,
      destination,
    )
  }
}

export const useLocalHandle = () => {
  const { data } = useSwr(
    "localHandle",
    async () => {
      const messageTarget: Window = window.opener ?? window.parent
      const localHandle = await getLocalHandle({
        remoteWindow: messageTarget,
        remoteOrigin: "*",
        localWindow: window,
      })
      return localHandle
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      onError: (e) => {
        console.error("Failed to connect to parent window", e)
      },
    },
  )
  return data
}

export const usePageGuard = () => {
  const router = useRouter()
  const localHandle = useLocalHandle()

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const newHeight = entries[0].target.clientHeight
      if (localHandle && newHeight) {
        localHandle.emit("ARGENT_WEB_WALLET::HEIGHT_CHANGED", newHeight)
      }
    })

    const handler = (url: string) => {
      if (localHandle) {
        const [pathname] = url.split("?")
        if (shouldShowIframe.includes(pathname)) {
          localHandle.emit("ARGENT_WEB_WALLET::SHOULD_SHOW", undefined)
          observer.observe(window.document.body)
        } else {
          localHandle.emit("ARGENT_WEB_WALLET::SHOULD_HIDE", undefined)
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

  useBackendAccount({
    onSuccess: async (account) => {
      if (account.accounts[0]) {
        if (
          (await getMemoryAccount()) ||
          (await retrieveAccountFromSession(account.accounts[0]).catch(
            () => false,
          ))
        ) {
          if (localHandle) {
            localHandle.emit("ARGENT_WEB_WALLET::CONNECT", undefined)
          }
          return conditionallyPushTo(router, "/dashboard")
        }
        return conditionallyPushTo(router, "/password", {
          email: account.email,
        })
      }
      return conditionallyPushTo(router, "/new-password", {
        email: account.email,
      })
    },
    onError: () => {
      return conditionallyPushTo(router, "/email")
    },
    dedupingInterval: 20000,
  })
}
