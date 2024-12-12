import { useNavigateBack } from "@argent/x-ui"
import type { FC } from "react"
import { useCallback } from "react"

import { routes } from "../../../shared/ui/routes"
// import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { useCustomNavigate } from "../recovery/hooks/useCustomNavigate"
import { useSeedRecovery } from "../recovery/seedRecovery.state"
import { OnboardingRestoreSeedScreen } from "./OnboardingRestoreSeedScreen"
import { useLocation } from "react-router-dom"

export const OnboardingRestoreSeedScreenContainer: FC = () => {
  const customNavigate = useCustomNavigate()
  const onBack = useNavigateBack()
  const { state } = useLocation()

  const onRestore = useCallback(
    async (seedPhrase: string) => {
      useSeedRecovery.setState({ seedPhrase })

      await customNavigate(routes.onboardingRestorePassword())
    },
    [customNavigate],
  )

  const onUseBackup = useCallback(() => {
    void customNavigate(routes.onboardingRestoreBackup())
  }, [customNavigate])

  return (
    <OnboardingRestoreSeedScreen
      onBack={onBack}
      onRestore={onRestore}
      onUseBackup={onUseBackup}
      presetSeed={state?.seed}
    />
  )
}
