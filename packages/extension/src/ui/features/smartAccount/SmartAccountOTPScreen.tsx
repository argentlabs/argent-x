import { FC, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  useRouteAccountAddress,
  useRouteEmailAddress,
  useRouteFlow,
} from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { SmartAccountBaseOTPScreen } from "./SmartAccountBaseOTPScreen"

export const SmartAccountOTPScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()
  const email = useRouteEmailAddress()
  const navigate = useNavigate()
  const flow = useRouteFlow()

  const onBack = useCallback(() => {
    navigate(
      routes.argentAccountEmail(accountAddress, flow, routes.accountTokens()),
    )
  }, [accountAddress, navigate, flow])

  const onOTPReEnterEmail = useCallback(async () => {
    navigate(
      routes.argentAccountEmail(accountAddress, flow, routes.accountTokens()),
      { replace: true },
    )
  }, [accountAddress, navigate, flow])

  const onOTPConfirmed = useCallback(() => {
    switch (flow) {
      case "toggleSmartAccount":
        return navigate(routes.smartAccountAction(accountAddress), {
          replace: true,
        })
      case "argentAccount":
        return navigate(routes.argentAccountLoggedIn(accountAddress), {
          replace: true,
        })
    }
  }, [accountAddress, navigate, flow])

  if (!email) {
    return (
      <Navigate
        to={routes.argentAccountEmail(
          accountAddress,
          flow,
          routes.accountTokens(),
        )}
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
