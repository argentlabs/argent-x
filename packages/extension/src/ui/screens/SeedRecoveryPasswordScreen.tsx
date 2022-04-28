import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { useBackupRequired } from "../states/backupDownload"
import {
  useSeedRecover,
  validateAndSetPassword,
  validateSeedRecoverStateIsComplete,
} from "../states/seedRecover"
import { recoverBySeedPhrase } from "../utils/messaging"
import { recover } from "../utils/recovery"
import { NewWalletScreen } from "./NewWalletScreen"

export const SeedRecoveryPasswordScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <NewWalletScreen
      overrideTitle="New password"
      overrideSubmitText="Continue"
      overrideSubmit={async ({ password }) => {
        try {
          validateAndSetPassword(password)
          const state = useSeedRecover.getState()
          if (validateSeedRecoverStateIsComplete(state)) {
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
