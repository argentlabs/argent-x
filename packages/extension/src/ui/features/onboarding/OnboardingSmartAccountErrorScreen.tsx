import type { FC } from "react"
import { useCallback } from "react"

import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import SmartAccountError from "../smartAccount/ui/SmartAccountError"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

export interface OnboardingSmartAccountErrorScreenProps {
  onBack?: () => void
  error: SmartAccountValidationErrorMessage
  onDone: () => void
}

export const OnboardingSmartAccountErrorScreen: FC<
  OnboardingSmartAccountErrorScreenProps
> = ({ onBack, error, onDone }) => {
  const onDoneClick = useCallback(() => {
    onDone()
  }, [onDone])

  return (
    <OnboardingScreen
      onBack={onBack}
      length={5} // there are 5 steps in the onboarding process
      currentIndex={3} // this is the 4th step, part of the smart account onboarding
      title={"Oops, wrong email"}
      subtitle={<SmartAccountError error={error} />}
      illustration="email-wrong"
    >
      <OnboardingButton mt={3} onClick={onDoneClick}>
        Try again
      </OnboardingButton>
    </OnboardingScreen>
  )
}
