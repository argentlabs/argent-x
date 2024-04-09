import { useNavigateBack } from "@argent/x-ui"
import { FC, useCallback } from "react"

import { routes } from "../../routes"
// import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { useCustomNavigate } from "../recovery/hooks/useCustomNavigate"
import { useSeedRecovery } from "../recovery/seedRecovery.state"
import { OnboardingRestoreSeedScreen } from "./OnboardingRestoreSeedScreen"

export const OnboardingRestoreSeedScreenContainer: FC = () => {
  const customNavigate = useCustomNavigate()
  const onBack = useNavigateBack()

  const onRestore = useCallback(
    async (seedPhrase: string) => {
      useSeedRecovery.setState({ seedPhrase })

      await customNavigate(routes.onboardingRestorePassword())
    },
    [customNavigate],
  )

  const onUseBackup = useCallback(() => {
    customNavigate(routes.onboardingRestoreBackup())
  }, [customNavigate])

  return (
    <OnboardingRestoreSeedScreen
      onBack={onBack}
      onRestore={onRestore}
      onUseBackup={onUseBackup}
    />
  )
}
