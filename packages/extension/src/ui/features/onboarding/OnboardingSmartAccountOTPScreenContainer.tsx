import type { FC } from "react"
import { useCallback, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { ampli } from "../../../shared/analytics"
import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import { routes } from "../../../shared/ui/routes"
import { useRouteEmailAddress } from "../../hooks/useRoute"
import { OnboardingSmartAccountErrorScreen } from "./OnboardingSmartAccountErrorScreen"
import { OnboardingSmartAccountOTPScreen } from "./OnboardingSmartAccountOTPScreen"

export const OnboardingSmartAccountOTPScreenContainer: FC = () => {
  const email = useRouteEmailAddress()
  const navigate = useNavigate()
  const [smartAccountValidationError, setSmartAccountValidationError] =
    useState<SmartAccountValidationErrorMessage | null>(null)

  const onReEnterEmail = useCallback(() => {
    ampli.onboardingEmailFlowAborted({
      "wallet platform": "browser extension",
    })
    navigate(routes.onboardingSmartAccountEmail())
  }, [navigate])

  const onSmartAccountValdationErrorDone = useCallback(() => {
    onReEnterEmail()
  }, [onReEnterEmail])

  const onOTPConfirmed = useCallback(() => {
    ampli.onboardingCompleted({
      "account type": "smart",
      "wallet platform": "browser extension",
    })
    return navigate(routes.onboardingFinish.path, { replace: true })
  }, [navigate])

  if (!email) {
    return <Navigate to={routes.onboardingSmartAccountEmail()} />
  }

  if (smartAccountValidationError) {
    return (
      <OnboardingSmartAccountErrorScreen
        onBack={onReEnterEmail}
        error={smartAccountValidationError}
        onDone={onSmartAccountValdationErrorDone}
      />
    )
  }

  return (
    <OnboardingSmartAccountOTPScreen
      email={email}
      onReEnterEmail={onReEnterEmail}
      onOTPConfirmed={onOTPConfirmed}
      setSmartAccountValidationError={setSmartAccountValidationError}
    />
  )
}
