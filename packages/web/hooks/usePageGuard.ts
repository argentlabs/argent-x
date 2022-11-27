import { NextRouter, useRouter } from "next/router"

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
