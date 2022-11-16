import { NextRouter, useRouter } from "next/router"
import useSwr from "swr"

import { getAccount as getMemoryAccount } from "../services/account"
import { getAccount } from "../services/backend/account"

const allowedDestinations = {
  "/email": ["/email", "/pin"],
  "/password": ["/password"],
  "/new-password": ["/new-password"],
  "/dashboard": ["/dashboard"],
}

const conditionallyPushTo = (
  router: NextRouter,
  destination: keyof typeof allowedDestinations,
  urlParams?: Record<string, string>,
) => {
  const allowed = allowedDestinations[destination]
  if (!allowed.includes(router.asPath ?? router.pathname)) {
    return router.push(
      `${destination}?${new URLSearchParams(urlParams)}`,
      destination,
    )
  }
}

export const usePageGuard = () => {
  const router = useRouter()
  useSwr("services/backend/account/getAccount", () => getAccount(), {
    onSuccess: async (account) => {
      if ((account.accounts?.length ?? 0) > 0) {
        if (await getMemoryAccount()) {
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
