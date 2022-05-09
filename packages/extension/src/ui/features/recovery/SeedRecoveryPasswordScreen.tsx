import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { NewWalletScreen } from "../../screens/NewWalletScreen"
import { recoverBySeedPhrase } from "../../utils/messaging"
import { useBackupRequired } from "./backupDownload.state"
import { recover } from "./recovery.service"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "./seedRecover.state"

export const SeedRecoveryPasswordScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <NewWalletScreen
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
