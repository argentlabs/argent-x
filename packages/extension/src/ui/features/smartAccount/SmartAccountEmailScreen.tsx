import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useRouteAccountAddress } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const SmartAccountEmailScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      if (accountAddress) {
        navigate(
          routes.smartAccountOTP(accountAddress, email, "toggleSmartAccount"),
        )
      }
    },
    [accountAddress, navigate],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={"toggleSmartAccount"}
    />
  )
}
