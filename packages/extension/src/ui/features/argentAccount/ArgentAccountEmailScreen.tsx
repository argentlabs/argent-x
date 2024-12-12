import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  useReturnTo,
  useRouteAccountId,
  useRouteFlow,
} from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const ArgentAccountEmailScreen: FC = () => {
  const flow = useRouteFlow()
  const accountId = useRouteAccountId()
  const navigate = useNavigate()
  const returnTo = useReturnTo()

  const onBack = useCallback(() => {
    navigate(returnTo ?? routes.accountTokens())
  }, [navigate, returnTo])

  const onEmailRequested = useCallback(
    (email: string) => {
      if (accountId) {
        navigate(routes.smartAccountOTP(accountId, email, flow))
      }
    },
    [accountId, navigate, flow],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={flow}
    />
  )
}
