import type { FC } from "react"
import { useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { useRouteEmailAddress } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { SmartAccountBaseOTPScreen } from "./SmartAccountBaseOTPScreen"

export const CreateSmartAccountOTPScreen: FC = () => {
  const email = useRouteEmailAddress()
  const navigate = useNavigate()

  const onBack = useCallback(() => {
    navigate(routes.createSmartAccountEmail(routes.accountTokens()))
  }, [navigate])

  const onOTPReEnterEmail = useCallback(async () => {
    navigate(routes.createSmartAccountEmail(routes.accountTokens()), {
      replace: true,
    })
  }, [navigate])

  const onOTPConfirmed = useCallback(() => {
    return navigate(routes.accounts(), {
      replace: true,
    })
  }, [navigate])

  if (!email) {
    return (
      <Navigate to={routes.createSmartAccountEmail(routes.accountTokens())} />
    )
  }

  return (
    <SmartAccountBaseOTPScreen
      onBack={onBack}
      email={email}
      onOTPReEnterEmail={() => void onOTPReEnterEmail()}
      onOTPConfirmed={onOTPConfirmed}
    />
  )
}
