import { useNavigateBack, useToast } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { recoveryService } from "../../services/recovery"
import { useBackupRequired } from "../recovery/backupDownload.state"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "../recovery/seedRecovery.state"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"

export const OnboardingRestorePasswordScreenContainer: FC = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const onBack = useNavigateBack()

  // TBD: what kind of tracking do we need here? Was the tracking from the other container correct?

  const handleSubmit = async (password: string) => {
    validateAndSetPassword(password) // NOTE: password should have been validated in the form already
    const state = useSeedRecovery.getState()

    try {
      if (!validateSeedRecoveryCompletion(state)) {
        throw new Error("Seed recovery is not complete")
      }

      // should throw right away, no return value needed; to be replaced with a service which uses the new transport
      const isSuccess = await recoveryService.bySeedPhrase(
        state.seedPhrase,
        state.password,
      )
      if (!isSuccess) {
        throw new Error("Unable to recover the account")
      }

      useBackupRequired.setState({ isBackupRequired: false }) // as the user recovered their seed, we can assume they have a backup

      navigate(routes.onboardingFinish.path, { replace: true })
    } catch (err) {
      toast({
        title: "Unable to recover the account",
        status: "error",
        duration: 3000,
      })

      throw err
    }
  }
  return (
    <OnboardingPasswordScreen
      title="New password"
      submitText={{
        start: "Continue",
        submitting: "Restoring...",
        retryAfterError: "Retry recovery",
      }}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  )
}
