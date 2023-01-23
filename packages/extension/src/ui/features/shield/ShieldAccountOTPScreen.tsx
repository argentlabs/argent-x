import { resetDevice } from "@argent/guardian"
import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  routes,
  useRouteAccountAddress,
  useRouteEmailAddress,
} from "../../routes"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"

export const ShieldAccountOTPScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const email = useRouteEmailAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.shieldAccountEmail(accountAddress))
  }, [accountAddress, navigate])

  const onOTPNotRequested = useCallback(async () => {
    await resetDevice()
    navigate(routes.shieldAccountEmail(accountAddress), { replace: true })
  }, [accountAddress, navigate])

  const onOTPConfirmed = useCallback(() => {
    navigate(routes.shieldAccountAction(accountAddress), { replace: true })
  }, [accountAddress, navigate])

  if (!email) {
    return <Navigate to={routes.shieldAccountEmail(accountAddress)} />
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
