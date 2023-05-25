import { FC, MouseEventHandler } from "react"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"

export interface OnboardingPrivacyStatementScreenProps {
  onBack?: MouseEventHandler
}

export const OnboardingPrivacyStatementScreen: FC<
  OnboardingPrivacyStatementScreenProps
> = ({ onBack }) => {
  return (
    <OnboardingScreen onBack={onBack} title="Privacy statement">
      <PrivacyStatementText />
      <OnboardingButton mt={8} onClick={onBack}>
        Back
      </OnboardingButton>
    </OnboardingScreen>
  )
}
