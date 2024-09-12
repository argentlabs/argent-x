import React, { useCallback, useState } from "react"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { Navigate, useNavigate } from "react-router-dom"
import { useRouteEmailAddress } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import SmartAccountOTPForm from "../smartAccount/SmartAccountOTPForm"
import { OnboardingSmartAccountErrorScreen } from "./OnboardingSmartAccountErrorScreen"
import { ampli } from "../../../shared/analytics"
import { useOnboardingExperiment } from "../../services/onboarding/useOnboardingExperiment"

const OnboardingSmartAccountOTPScreen: React.FC = () => {
  const email = useRouteEmailAddress()
  const navigate = useNavigate()
  const [smartAccountValdationError, setSmartAccountValdationError] =
    useState<SmartAccountValidationErrorMessage | null>(null)
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const onReEnterEmail = useCallback(() => {
    ampli.onboardingEmailFlowAborted({
      "wallet platform": "browser extension",
      "onboarding experiment": onboardingExperimentCohort,
    })
    navigate(routes.onboardingSmartAccountEmail())
  }, [navigate, onboardingExperimentCohort])

  const onSmartAccountValdationErrorDone = useCallback(() => {
    onReEnterEmail()
  }, [onReEnterEmail])

  const onOTPConfirmed = useCallback(() => {
    ampli.onboardingCompleted({
      "account type": "smart",
      "wallet platform": "browser extension",
      "onboarding experiment": onboardingExperimentCohort,
    })
    return navigate(routes.onboardingFinish.path, { replace: true })
  }, [navigate, onboardingExperimentCohort])

  if (!email) {
    return <Navigate to={routes.onboardingSmartAccountEmail()} />
  }

  if (smartAccountValdationError) {
    return (
      <OnboardingSmartAccountErrorScreen
        onBack={onReEnterEmail}
        error={smartAccountValdationError}
        onDone={onSmartAccountValdationErrorDone}
      />
    )
  }

  return (
    <OnboardingScreen
      onBack={onReEnterEmail}
      length={5} // there are 5 steps in the onboarding process
      currentIndex={3} // this is the 4th step, part of the smart account onboarding
      title={"Check your email"}
      subtitle={`We’ve sent a verification code to ${email}`}
    >
      <SmartAccountOTPForm
        email={email}
        onOTPReEnterEmail={onReEnterEmail}
        onOTPConfirmed={onOTPConfirmed}
        onValidationError={setSmartAccountValdationError}
        flow={"createSmartAccount"}
        pinInputWidth={18}
      />
    </OnboardingScreen>
  )
}

export default OnboardingSmartAccountOTPScreen
