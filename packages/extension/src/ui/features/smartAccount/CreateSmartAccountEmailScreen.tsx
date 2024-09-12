import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"

export const CreateSmartAccountEmailScreen: FC = () => {
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  const onEmailRequested = useCallback(
    (email: string) => {
      navigate(routes.createSmartAccountOTP(email, "createSmartAccount"))
    },
    [navigate],
  )

  return (
    <ArgentAccountBaseEmailScreen
      onBack={onBack}
      onEmailRequested={onEmailRequested}
      flow={"createSmartAccount"}
    />
  )
}
