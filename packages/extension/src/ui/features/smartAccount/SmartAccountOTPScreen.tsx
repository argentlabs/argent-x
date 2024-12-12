import type { FC } from "react"
import { useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  useRouteAccountId,
  useRouteEmailAddress,
  useRouteFlow,
} from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { SmartAccountBaseOTPScreen } from "./SmartAccountBaseOTPScreen"

export const SmartAccountOTPScreen: FC = () => {
  const accountId = useRouteAccountId()
  const email = useRouteEmailAddress()
  const navigate = useNavigate()
  const flow = useRouteFlow()

  const onBack = useCallback(() => {
    navigate(routes.argentAccountEmail(accountId, flow, routes.accountTokens()))
  }, [accountId, navigate, flow])

  const onOTPReEnterEmail = useCallback(async () => {
    navigate(
      routes.argentAccountEmail(accountId, flow, routes.accountTokens()),
      { replace: true },
    )
  }, [accountId, navigate, flow])

  const onOTPConfirmed = useCallback(() => {
    switch (flow) {
      case "toggleSmartAccount":
        return navigate(routes.smartAccountAction(accountId), {
          replace: true,
        })
      case "argentAccount":
        return navigate(routes.argentAccountLoggedIn(accountId), {
          replace: true,
        })
    }
  }, [accountId, navigate, flow])

  if (!email) {
    return (
      <Navigate
        to={routes.argentAccountEmail(accountId, flow, routes.accountTokens())}
      />
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
