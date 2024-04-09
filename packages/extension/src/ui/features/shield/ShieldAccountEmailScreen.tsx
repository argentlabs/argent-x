import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useRouteAccountAddress } from "../../routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const ShieldAccountEmailScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      if (accountAddress) {
        navigate(routes.shieldAccountOTP(accountAddress, email, "shield"))
      }
    },
    [accountAddress, navigate],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={"shield"}
    />
  )
}
