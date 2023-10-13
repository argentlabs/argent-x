import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useRouteAccountAddress } from "../../routes"
import { useShieldOnboardingTracking } from "./useShieldTracking"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const ShieldAccountEmailScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: "enterEmail",
  })

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      void trackSuccess()
      if (accountAddress) {
        navigate(routes.shieldAccountOTP(accountAddress, email, "shield"))
      }
    },
    [accountAddress, navigate, trackSuccess],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={"shield"}
    />
  )
}
