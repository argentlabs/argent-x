import { useCallback } from "react"

import { Events } from "../../../shared/analytics"
import { getVerifiedEmail } from "../../../shared/shield/verifiedEmail"
import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { useAccountsWithGuardian } from "./useAccountGuardian"
import { useRouteAccount } from "./useRouteAccount"

export const useShieldTracking = <T extends keyof Events>(
  event: T,
  args: Events[T],
) => {
  const accountsWithGuardian = useAccountsWithGuardian()
  const accountsWith2fa = accountsWithGuardian.length

  const makeArgs = useCallback(async () => {
    const verifiedEmail = await getVerifiedEmail()
    const authenticated = Boolean(verifiedEmail)
    return {
      ...args,
      accountsWith2fa,
      authenticated,
    }
  }, [accountsWith2fa, args])

  return useTimeSpentWithSuccessTracking(event, makeArgs)
}

export const useShieldOnboardingTracking = (
  args:
    | Events["argentShieldRemovalStepFinished"]
    | Events["argentShieldOnboardingStepFinished"],
) => {
  const account = useRouteAccount()
  const hasGuardian = Boolean(account?.guardian)
  const event = hasGuardian
    ? "argentShieldRemovalStepFinished"
    : "argentShieldOnboardingStepFinished"

  return useShieldTracking(event, {
    ...args,
  })
}
