// TBD: should we get rid of the whole file? We dont use files anymore since a long time as a backup method. Would this be part of the refactor to drop such parts of the app? As it changes functionality
import { useNavigateBack } from "@argent/x-ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { fileToString } from "../../services/files"
import { clientRecoveryService } from "../../services/recovery"
import { OnboardingRestoreBackupScreen } from "./OnboardingRestoreBackupScreen"

export const OnboardingRestoreBackupScreenContainer: FC = () => {
  const navigate = useNavigate()
  const onBack = useNavigateBack()

  const onRestore = useCallback(
    async (acceptedFile: File) => {
      try {
        const data = await fileToString(acceptedFile)
        await clientRecoveryService.byBackup(data)
        navigate(routes.onboardingFinish.path, { replace: true })
      } catch (err: any) {
        const error = `${err}`
        const legacyError = "legacy backup file cannot be imported"
        if (error.toLowerCase().includes(legacyError)) {
          navigate(routes.legacy())
        } else {
          useAppState.setState({ error })
          navigate(routes.error())
        }
      }
    },
    [navigate],
  )

  return <OnboardingRestoreBackupScreen onRestore={onRestore} onBack={onBack} />
}
