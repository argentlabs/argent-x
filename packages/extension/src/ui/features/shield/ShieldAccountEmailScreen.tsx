import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useRouteAccountAddress } from "../../routes"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"
import { useRouteAccount } from "./useRouteAccount"
import { useShieldOnboardingTracking } from "./useShieldTracking"

export const ShieldAccountEmailScreen: FC = () => {
  const account = useRouteAccount()
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()
  const hasGuardian = Boolean(account?.guardian)

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: "enterEmail",
  })

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      trackSuccess()
      navigate(routes.shieldAccountOTP(accountAddress, email))
    },
    [accountAddress, navigate, trackSuccess],
  )

  return (
    <ShieldBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      hasGuardian={hasGuardian}
    />
  )
}
