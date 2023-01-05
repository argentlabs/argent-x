import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { resetDevice } from "../../../shared/shield/jwt"
import { routes, useRouteEmailAddress } from "../../routes"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"

export const ShieldActionOTPScreen: FC = () => {
  const email = useRouteEmailAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.shieldActionEmail(), { replace: true })
  }, [navigate])

  const onOTPNotRequested = useCallback(async () => {
    await resetDevice()
    navigate(routes.shieldActionEmail(), { replace: true })
  }, [navigate])

  const onOTPConfirmed = useCallback(() => {
    navigate(routes.accountTokens(), { replace: true })
  }, [navigate])

  if (!email) {
    return <Navigate to={routes.shieldActionEmail()} replace />
  }

  return (
    <ShieldBaseOTPScreen
      onBack={onBack}
      email={email}
      onOTPNotRequested={onOTPNotRequested}
      onOTPConfirmed={onOTPConfirmed}
    />
  )
}
