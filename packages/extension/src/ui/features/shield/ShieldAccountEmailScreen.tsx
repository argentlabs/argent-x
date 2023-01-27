import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useRouteAccountAddress } from "../../routes"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"

export const ShieldAccountEmailScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      navigate(routes.shieldAccountOTP(accountAddress, email))
    },
    [accountAddress, navigate],
  )

  return (
    <ShieldBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
    />
  )
}
