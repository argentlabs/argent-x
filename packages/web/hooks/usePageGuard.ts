import { NextRouter, useRouter } from "next/router"
import { useEffect } from "react"

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

export const usePageGuard = () => {
  const router = useRouter()

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const messageTarget: Window = window.opener ?? window.parent
      const newHeight = entries[0].target.clientHeight
      if (messageTarget && newHeight) {
        messageTarget.postMessage(
          {
            type: "ARGENT_WEB_WALLET::HEIGHT_CHANGED",
            data: {
              height: newHeight,
            },
          },
          "*",
        )
      }
    })

    const handler = (url: string) => {
      const messageTarget: Window = window.opener ?? window.parent
      console.log("change", url)
      if (messageTarget) {
        const [pathname] = url.split("?")
        if (shouldShowIframe.includes(pathname)) {
          messageTarget.postMessage(
            {
              type: "ARGENT_WEB_WALLET::SHOULD_SHOW",
            },
            "*",
          )
          observer.observe(window.document.body)
        } else {
          messageTarget.postMessage(
            {
              type: "ARGENT_WEB_WALLET::SHOULD_HIDE",
            },
            "*",
          )
          observer.disconnect()
        }
      }
      return true
    }
    router.events.on("routeChangeComplete", handler)
    return () => {
      router.events.off("routeChangeComplete", handler)
    }
  }, [router])

  useBackendAccount({
    onSuccess: async (account) => {
      if (account.accounts[0]) {
        if (
          (await getMemoryAccount()) ||
          (await retrieveAccountFromSession(account.accounts[0]).catch(
            () => false,
          ))
        ) {
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
