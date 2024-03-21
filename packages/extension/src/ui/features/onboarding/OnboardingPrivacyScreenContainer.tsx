import { useNavigateBack } from "@argent/x-ui"
import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { routes } from "../../routes"
import { PrivacyScreen } from "./OnboardingPrivacyScreen"
import { clientAccountService } from "../../services/account"

export const OnboardingPrivacyScreenContainer: FC = () => {
  const navigate = useNavigate()
  const onBack = useNavigateBack()
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
    <PrivacyScreen
      onBack={onBack}
      onAccept={handleAccept}
      onRefuse={handleRefuse}
      length={path === "seedphrase" ? 5 : 4}
    />
  )
}
