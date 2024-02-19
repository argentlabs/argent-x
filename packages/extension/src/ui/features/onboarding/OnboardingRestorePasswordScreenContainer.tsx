import { useNavigateBack, useToast } from "@argent/ui"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { clientRecoveryService } from "../../services/recovery"
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
import { errorRecoveringView } from "../../views/recovery"
import { useView } from "../../views/implementation/react"
import { getMessageFromTrpcError } from "../../../shared/errors/schema"

export const OnboardingRestorePasswordScreenContainer: FC = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const navigateBack = useNavigateBack()

  const onBack = useCallback(() => {
    void clientRecoveryService.clearErrorRecovering()
    navigateBack()
  }, [navigateBack])

  const [, setHasSavedRecoverySeedphrase] = useAtom(
    hasSavedRecoverySeedphraseAtom,
  )
  const errorRecovering = useView(errorRecoveringView)

  const buttonLabel = useMemo(
    () => (errorRecovering ? "Retry recovery" : "Continue"),
    [errorRecovering],
  )

  // TBD: what kind of tracking do we need here? Was the tracking from the other container correct?

  const handleSubmit = async (password: string) => {
    validateAndSetPassword(password) // NOTE: password should have been validated in the form already
    const state = useSeedRecovery.getState()

    try {
      if (!validateSeedRecoveryCompletion(state)) {
        throw new RecoveryError({ code: "SEED_RECOVERY_INCOMPLETE" })
      }

      // should throw right away, no return value needed;
      await clientRecoveryService.bySeedPhrase(state.seedPhrase, state.password)

      setHasSavedRecoverySeedphrase(true) // as the user recovered their seed, we can assume they have a backup

      navigate(routes.onboardingFinish.path, { replace: true })
    } catch (error) {
      // debugger // eslint-disable-line no-debugger
      let errorDetails = getMessageFromTrpcError(error)
      if (!errorDetails) {
        if (
          isErrorOfType<WalletValidationErrorMessage>(error, "WalletError") &&
          error.data.code
        ) {
          errorDetails = WALLET_ERROR_MESSAGES[error.data.code]
          console.warn(error.data)
        } else if (
          isErrorOfType<RecoveryErrorMessage>(error, "RecoveryError") &&
          error.data.message
        ) {
          errorDetails = error.data.message
        }
        errorDetails = "Unknown error"
      }
      console.error(`Unable to recover the account - ${errorDetails}`, error)
      toast({
        title: `Unable to recover the account - ${errorDetails}`,
        status: "error",
        duration: 3000,
      })
      throw error
    }
  }
  return (
    <OnboardingPasswordScreen
      title="New password"
      submitText={{
        start: buttonLabel,
        submitting: "Restoring…",
      }}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  )
}
