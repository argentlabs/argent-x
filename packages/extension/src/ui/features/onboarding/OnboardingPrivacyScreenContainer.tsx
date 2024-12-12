import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { OnboardingPrivacyScreen } from "./OnboardingPrivacyScreen"
import { clientAccountService } from "../../services/account"

export const OnboardingPrivacyScreenContainer: FC = () => {
  const navigate = useNavigate()

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
    void clientAccountService.refuseTerms()
    navigateToNextScreen()
  }
  const handleAccept = () => {
    void clientAccountService.acceptTerms()
    navigateToNextScreen()
  }
  return (
    <OnboardingPrivacyScreen
      onBack={onBack}
      onAccept={handleAccept}
      onRefuse={handleRefuse}
      length={path === "seedphrase" ? 6 : 5}
    />
  )
}
