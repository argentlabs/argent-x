import { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { PrivacyScreen } from "./OnboardingPrivacyScreen"
import { clientAccountService } from "../../services/account"
import { useOnboardingExperiment } from "../../services/onboarding/useOnboardingExperiment"

export const OnboardingPrivacyScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const onBack = useCallback(() => {
    navigate(routes.onboardingStart())
  }, [navigate])

  const { path } = useParams()
  const navigateToNextScreen = () => {
    if (path === "password") {
      void navigate(routes.onboardingPassword())
    } else {
      void navigate(routes.onboardingRestoreSeed())
    }
  }
  const handleRefuse = () => {
    void clientAccountService.refuseTerms({ onboardingExperimentCohort })
    navigateToNextScreen()
  }
  const handleAccept = () => {
    void clientAccountService.acceptTerms({ onboardingExperimentCohort })
    navigateToNextScreen()
  }
  return (
    <PrivacyScreen
      onBack={onBack}
      onAccept={handleAccept}
      onRefuse={handleRefuse}
      length={path === "seedphrase" ? 6 : 5}
    />
  )
}
