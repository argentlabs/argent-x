import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  routes,
  useReturnTo,
  useRouteAccountAddress,
  useRouteFlow,
} from "../../routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const ArgentAccountEmailScreen: FC = () => {
  const flow = useRouteFlow()
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()
  const returnTo = useReturnTo()

  const onBack = useCallback(() => {
    navigate(returnTo ?? routes.accountTokens())
  }, [navigate, returnTo])

  const onEmailRequested = useCallback(
    (email: string) => {
      if (accountAddress) {
        navigate(routes.shieldAccountOTP(accountAddress, email, flow))
      }
    },
    [accountAddress, navigate, flow],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={flow}
    />
  )
}
