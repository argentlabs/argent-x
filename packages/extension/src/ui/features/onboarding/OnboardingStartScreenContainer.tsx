import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { OnboardingStartScreen } from "./OnboardingStartScreen"

export const OnboardingStartScreenContainer: FC = () => {
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "welcome" },
  )

  const navigate = useNavigate()

  const onCreate = useCallback(() => {
    void trackSuccess()
    void navigate(routes.onboardingDisclaimer())
  }, [navigate, trackSuccess])

  const onRestore = useCallback(() => {
    void trackSuccess() // NOTE: there is nothing different between restore and create, so we track the same event?
    void navigate(routes.onboardingRestoreSeed())
  }, [navigate, trackSuccess])

  return <OnboardingStartScreen onCreate={onCreate} onRestore={onRestore} />
}
