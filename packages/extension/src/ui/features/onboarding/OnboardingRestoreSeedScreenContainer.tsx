import { useNavigateBack } from "@argent/ui"
import { FC, useCallback } from "react"

import { routes } from "../../routes"
import {
  usePageTracking,
  useTimeSpentWithSuccessTracking,
} from "../../services/analytics"
import { useCustomNavigate } from "../recovery/hooks/useCustomNavigate"
import { useSeedRecovery } from "../recovery/seedRecovery.state"
import { OnboardingRestoreSeedScreen } from "./OnboardingRestoreSeedScreen"

export const OnboardingRestoreSeedScreenContainer: FC = () => {
  usePageTracking("restoreWallet")

  const { trackSuccess } = useTimeSpentWithSuccessTracking(
    "onboardingStepFinished",
    { stepId: "restoreSeedphrase" },
  )
  const customNavigate = useCustomNavigate()
  const onBack = useNavigateBack()

  const onRestore = useCallback(
    async (seedPhrase: string) => {
      // seedPhrase was already validated in the OnboardingRestoreSeedScreen form and will be validated again in the BG
      useSeedRecovery.setState({ seedPhrase }) // set to temorary state, so we can access it after the next screen
      void trackSuccess()
      await customNavigate(routes.onboardingRestorePassword())
    },
    [customNavigate, trackSuccess],
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
