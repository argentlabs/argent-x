import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { sessionService } from "../../services/session"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"
import { ampli } from "../../../shared/analytics"
import { useOnboardingExperiment } from "../../services/onboarding/useOnboardingExperiment"

export const OnboardingPasswordScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { onboardingExperimentCohort } = useOnboardingExperiment()

  const onBack = useCallback(() => {
    navigate(routes.onboardingPrivacy("password"))
  }, [navigate])

  const handleSubmit = useCallback(
    async (password: string) => {
      await sessionService.startSession(password)
      ampli.onboardingPasswordSet({
        "wallet platform": "browser extension",
        "onboarding experiment": onboardingExperimentCohort,
      })
      return navigate(routes.onboardingAccountType.path, { replace: true })
    },
    [navigate, onboardingExperimentCohort],
  )

  return (
    <OnboardingPasswordScreen
      onBack={onBack}
      title={"New wallet"}
      onSubmit={handleSubmit}
    />
  )
}
