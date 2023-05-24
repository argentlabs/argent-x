import { useNavigateBack } from "@argent/ui"
import { FC } from "react"

import { OnboardingPrivacyStatementScreen } from "./OnboardingPrivacyStatementScreen"

export const OnboardingPrivacyStatementScreenContainer: FC = () => {
  const onBack = useNavigateBack()
  return <OnboardingPrivacyStatementScreen onBack={onBack} />
}
