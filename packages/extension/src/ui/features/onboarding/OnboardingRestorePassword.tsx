import { useToast } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { recoverBySeedPhrase } from "../../services/backgroundRecovery"
import { useBackupRequired } from "../recovery/backupDownload.state"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "../recovery/seedRecovery.state"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"

export const OnboardingRestorePassword: FC = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const handleSubmit = async ({ password }: { password: string }) => {
    validateAndSetPassword(password)
    const state = useSeedRecovery.getState()
    if (validateSeedRecoveryCompletion(state)) {
      try {
        const isSuccess = await recoverBySeedPhrase(
          state.seedPhrase,
          state.password,
        )
        useBackupRequired.setState({ isBackupRequired: false }) // as the user recovered their seed, we can assume they have a backup
        if (isSuccess) {
          navigate(routes.onboardingFinish.path, { replace: true })
        } else {
          toast({
            title: "Unable to recover the account",
            status: "error",
            duration: 3000,
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
  return (
    <OnboardingPasswordScreen
      overrideTitle="New password"
      overrideSubmitText="Continue"
      overrideSubmit={handleSubmit}
    />
  )
}
