import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { resetDevice } from "../../../shared/shield/jwt"
import {
  routes,
  useRouteAccountAddress,
  useRouteEmailAddress,
} from "../../routes"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"
import { useShieldOnboardingTracking } from "./useShieldTracking"

export const ShieldAccountOTPScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const email = useRouteEmailAddress()
  const navigate = useNavigate()

  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: "enterPasscode",
  })

  const onBack = useCallback(() => {
    navigate(routes.shieldAccountEmail(accountAddress))
  }, [accountAddress, navigate])

  const onOTPReEnterEmail = useCallback(async () => {
    await resetDevice()
    navigate(routes.shieldAccountEmail(accountAddress), { replace: true })
  }, [accountAddress, navigate])

  const onOTPConfirmed = useCallback(() => {
    trackSuccess()
    navigate(routes.shieldAccountAction(accountAddress), { replace: true })
  }, [accountAddress, navigate, trackSuccess])

  if (!email) {
    return <Navigate to={routes.shieldAccountEmail(accountAddress)} />
  }

  return (
    <ShieldBaseOTPScreen
      onBack={onBack}
      email={email}
      onOTPReEnterEmail={onOTPReEnterEmail}
      onOTPConfirmed={onOTPConfirmed}
    />
  )
}
