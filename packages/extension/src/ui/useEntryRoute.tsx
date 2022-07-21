import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAppState } from "./app.state"
import { recover } from "./features/recovery/recovery.service"
import { routes } from "./routes"
import { hasActiveSession, isInitialized } from "./services/backgroundSessions"

export const useEntryRoute = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isFirstRender } = useAppState()

  console.log("location", location)
  const targetRoute: string = location.search.replace(/^\?route=/, "")

  useEffect(() => {
    ;(async () => {
      if (isFirstRender) {
        const entry = await determineEntry(targetRoute)
        useAppState.setState({ isLoading: false, isFirstRender: false })
        navigate(entry)
      }
    })()
  }, [isFirstRender, navigate, targetRoute])
}

const determineEntry = async (targetRoute: string) => {
  const { initialized, hasLegacy } = await isInitialized()
  if (!initialized) {
    if (hasLegacy) {
      return routes.legacy()
    }

    return routes.welcome()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    if (targetRoute === routes.settingsNetworkLogging.path) {
      return recover({ showNetworkLogs: true })
    }
    return recover()
  }
  return routes.lockScreen()
}
