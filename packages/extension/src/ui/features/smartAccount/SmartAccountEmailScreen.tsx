import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useRouteAccountId } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const SmartAccountEmailScreen: FC = () => {
  const accountId = useRouteAccountId()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      if (accountId) {
        navigate(routes.smartAccountOTP(accountId, email, "toggleSmartAccount"))
      }
    },
    [accountId, navigate],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={"toggleSmartAccount"}
    />
  )
}
