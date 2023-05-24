import { FC, useCallback } from "react"

import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { OnboardingFinishScreen } from "./OnboardingFinishScreen"

export const OnboardingFinishScreenContainer: FC = () => {
  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "finish" },
  )
  const onFinish = useCallback(() => {
    void trackSuccess()
    window.close()
  }, [trackSuccess])

  return <OnboardingFinishScreen onFinish={onFinish} />
}
