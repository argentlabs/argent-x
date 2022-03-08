import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../routes"
import { useAppState } from "../states/app"
import { useBackupDownload } from "../states/backupDownload"
import { hasActiveSession, isInitialized } from "../utils/messaging"
import { recover } from "../utils/recovery"

export const useEntry = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()
  const { isBackupDownloadRequired } = useBackupDownload()

  useEffect(() => {
    ;(async () => {
      if (!isFirstRender) {
        return
      }
      const entry = await determineEntry(isBackupDownloadRequired)
      useAppState.setState({ isLoading: false, isFirstRender: false })
      navigate(entry)
    })()
  }, [navigate, isBackupDownloadRequired])
}

const determineEntry = async (isBackupDownloadRequired: boolean) => {
  if (isBackupDownloadRequired) {
    return routes.backupDownload()
  }

  const { initialized, hasLegacy } = await isInitialized()
  if (!initialized) {
    if (hasLegacy) {
      return routes.legacy()
    }
    return routes.welcome()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    return recover()
  }
  return routes.password()
}
