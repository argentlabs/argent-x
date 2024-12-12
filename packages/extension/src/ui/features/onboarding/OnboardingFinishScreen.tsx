import type { FC } from "react"

import { useOnboardingToastMessage } from "./hooks/useOnboardingToastMessage"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { OnboardingFinishSmartAccountFeaturesRow } from "./ui/OnboardingFinishSmartAccountFeaturesRow"
import { OnboardingFinishArgentLinksRow } from "./ui/OnboardingFinishArgentLinksRow"

export interface OnboardingFinishScreenProps {
  isSmart?: boolean
}

export const OnboardingFinishScreen: FC<OnboardingFinishScreenProps> = ({
  isSmart,
}) => {
  useOnboardingToastMessage()
  return (
    <OnboardingScreen
      length={5} // there are 5 steps in the onboarding process
      currentIndex={4} // this is the last step
      title={
        isSmart ? "Your smart account is ready!" : "Your account is ready!"
      }
      subtitle="Get ready to experience the power of Argent + Starknet"
      illustration={isSmart ? "account-smart" : "account-standard"}
    >
      {isSmart && <OnboardingFinishSmartAccountFeaturesRow mb={8} />}
      <OnboardingFinishArgentLinksRow w="full" />
    </OnboardingScreen>
  )
}
