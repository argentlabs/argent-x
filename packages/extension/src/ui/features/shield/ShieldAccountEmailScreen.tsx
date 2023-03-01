import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useRouteAccountAddress } from "../../routes"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"
import { useRouteAccount } from "./useRouteAccount"

export const ShieldAccountEmailScreen: FC = () => {
  const account = useRouteAccount()
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()
  const hasGuardian = Boolean(account?.guardian)

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
      hasGuardian={hasGuardian}
    />
  )
}
