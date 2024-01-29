import { useNavigateBack } from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
// import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { OnboardingDisclaimerScreen } from "./OnboardingDisclaimerScreen"

export const OnboardingDisclaimerScreenContainer: FC = () => {
  // const { trackSuccess } = useTimeSpentWithSuccessTracking(
  //   "onboardingStepFinished",
  //   { stepId: "disclaimer" },
  // )

  const navigate = useNavigate()
  const onBack = useNavigateBack()

  const onContinue = useCallback(() => {
    // trackSuccess() // TODO: temporary disabled
    navigate(routes.onboardingPassword())
  }, [navigate])

  const onPrivacy = useCallback(() => {
    navigate(routes.onboardingPrivacyStatement())
  }, [navigate])

  return (
    <OnboardingDisclaimerScreen
      onBack={onBack}
      onContinue={onContinue}
      onPrivacy={onPrivacy}
    />
  )
}
