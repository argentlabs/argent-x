import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  routes,
  useRouteAccountAddress,
  useRouteEmailAddress,
  useRouteFlow,
} from "../../routes"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"
import { useShieldOnboardingTracking } from "./useShieldTracking"

export const ShieldAccountOTPScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const email = useRouteEmailAddress()
  const navigate = useNavigate()
  const flow = useRouteFlow()
  const { trackSuccess } = useShieldOnboardingTracking({
    stepId: "enterPasscode",
  })

  const onBack = useCallback(() => {
    navigate(
      routes.argentAccountEmail(accountAddress, flow, routes.accountTokens()),
    )
  }, [accountAddress, navigate, flow])

  const onOTPReEnterEmail = useCallback(async () => {
    navigate(
      routes.argentAccountEmail(accountAddress, flow, routes.accountTokens()),
      { replace: true },
    )
  }, [accountAddress, navigate, flow])

  const onOTPConfirmed = useCallback(() => {
    void trackSuccess()
    switch (flow) {
      case "shield":
        return navigate(routes.shieldAccountAction(accountAddress), {
          replace: true,
        })
      case "argentAccount":
        return navigate(routes.argentAccountLoggedIn(accountAddress), {
          replace: true,
        })
      case "emailPreferences":
        return navigate(routes.settingsEmailNotifications(), {
          replace: true,
        })
    }
  }, [accountAddress, navigate, trackSuccess, flow])

  if (!email) {
    return (
      <Navigate
        to={routes.argentAccountEmail(
          accountAddress,
          flow,
          routes.accountTokens(),
        )}
      />
    )
  }

  return (
    <ShieldBaseOTPScreen
      onBack={onBack}
      email={email}
      onOTPReEnterEmail={() => void onOTPReEnterEmail()}
      onOTPConfirmed={onOTPConfirmed}
    />
  )
}
