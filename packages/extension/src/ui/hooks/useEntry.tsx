import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../routes"
import { useAppState } from "../states/app"
import { isDisclaimerUnderstood } from "../utils/disclaimer"
import { hasActiveSession, isInitialized } from "../utils/messaging"
import { recover } from "../utils/recovery"

export const useEntry = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()

  useEffect(() => {
    ;(async () => {
      if (!isFirstRender) {
        return
      }
      const entry = await determineEntry()
      useAppState.setState({ isLoading: false, isFirstRender: false })
      navigate(entry)
    })()
  }, [navigate])
}

const determineEntry = async () => {
  const initialized = await isInitialized()
  if (!initialized) {
    if (!isDisclaimerUnderstood()) {
      return routes.disclaimer
    }
    return routes.welcome
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    return recover()
  }
  return routes.password
}
