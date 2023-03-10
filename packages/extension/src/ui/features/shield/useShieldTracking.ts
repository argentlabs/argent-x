import { Events } from "../../../shared/analytics"
import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { useAccountsWithGuardian } from "./useAccountGuardian"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

export const useShieldTracking = <T extends keyof Events>(
  event: T,
  args: Events[T],
) => {
  const accountsWithGuardian = useAccountsWithGuardian()
  const verifiedEmail = useShieldVerifiedEmail()
  const authenticated = Boolean(verifiedEmail)
  const accountsWith2fa = accountsWithGuardian.length

  return useTimeSpentWithSuccessTracking(event, {
    ...args,
    accountsWith2fa,
    authenticated,
  })
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
