import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "./app.state"
import { recover } from "./features/recovery/recovery.service"
import { routes } from "./routes"
import { hasActiveSession, isInitialized } from "./services/backgroundSessions"

export const useEntryRoute = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()

  useEffect(() => {
    ;(async () => {
      if (isFirstRender) {
        const entry = await determineEntry()
        useAppState.setState({ isLoading: false, isFirstRender: false })
        navigate(entry)
      }
    })()
  }, [isFirstRender, navigate])
}

const determineEntry = async () => {
  const { initialized } = await isInitialized()
  if (!initialized) {
    return routes.welcome()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    return recover()
  }
  return routes.lockScreen()
}
