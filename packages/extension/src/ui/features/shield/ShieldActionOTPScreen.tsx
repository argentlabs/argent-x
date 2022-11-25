import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { routes, useRouteEmailAddress } from "../../routes"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"

export const ShieldActionOTPScreen: FC = () => {
  const email = useRouteEmailAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.shieldActionEmail())
  }, [navigate])

  const onOTPConfirmed = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  if (!email) {
    return <Navigate to={routes.shieldActionEmail()} />
  }
  return (
    <ShieldBaseOTPScreen
      onBack={onBack}
      email={email}
      onOTPConfirmed={onOTPConfirmed}
    />
  )
}
