import { useNavigateBack, useToast } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { recoveryService } from "../../services/recovery"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "../recovery/seedRecovery.state"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"
import { useAtom } from "jotai"
import { hasSavedRecoverySeedphraseAtom } from "../recovery/hasSavedRecoverySeedphraseAtom"
import { isErrorOfType } from "../../../shared/errors/errorData"
import {
  WALLET_ERROR_MESSAGES,
  WalletValidationErrorMessage,
} from "../../../shared/errors/wallet"
import {
  RecoveryError,
  RecoveryErrorMessage,
} from "../../../shared/errors/recovery"

export const OnboardingRestorePasswordScreenContainer: FC = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const onBack = useNavigateBack()
  const [, setHasSavedRecoverySeedphrase] = useAtom(
    hasSavedRecoverySeedphraseAtom,
  )
  // TBD: what kind of tracking do we need here? Was the tracking from the other container correct?

  const handleSubmit = async (password: string) => {
    validateAndSetPassword(password) // NOTE: password should have been validated in the form already
    const state = useSeedRecovery.getState()

    try {
      if (!validateSeedRecoveryCompletion(state)) {
        throw new RecoveryError({ code: "SEED_RECOVERY_INCOMPLETE" })
      }

      // should throw right away, no return value needed; to be replaced with a service which uses the new transport
      await recoveryService.bySeedPhrase(state.seedPhrase, state.password)
      setHasSavedRecoverySeedphrase(true) // as the user recovered their seed, we can assume they have a backup

      navigate(routes.onboardingFinish.path, { replace: true })
    } catch (err) {
      let errorDetails = ""
      if (
        isErrorOfType<WalletValidationErrorMessage>(err, "WalletError") &&
        err.data.code
      ) {
        errorDetails = WALLET_ERROR_MESSAGES[err.data.code]
        console.warn(err.data)
      } else if (
        isErrorOfType<RecoveryErrorMessage>(err, "RecoveryError") &&
        err.data.message
      ) {
        errorDetails = err.data.message
      }
      console.error(`Unable to recover the account. ${errorDetails}`, err)
      toast({
        title: `Unable to recover the account. ${errorDetails}`,
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
