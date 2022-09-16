import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { recoverBySeedPhrase } from "../../services/backgroundRecovery"
import { OnboardingPasswordScreen } from "../onboarding/OnboardingPasswordScreen"
import { useBackupRequired } from "./backupDownload.state"
import { recover } from "./recovery.service"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "./seedRecovery.state"

export const SeedRecoveryPasswordScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <OnboardingPasswordScreen
      overrideTitle="New password"
      overrideSubmitText="Continue"
      overrideSubmit={async ({ password }) => {
        try {
          validateAndSetPassword(password)
          const state = useSeedRecovery.getState()
          if (validateSeedRecoveryCompletion(state)) {
            await recoverBySeedPhrase(state.seedPhrase, state.password)
            useBackupRequired.setState({ isBackupRequired: false }) // as the user recovered their seed, we can assume they have a backup
            navigate(await recover())
          }
        } catch {
          console.error("seed phrase is invalid")
        }
      }}
    />
  )
}
