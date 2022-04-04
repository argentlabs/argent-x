import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../routes"
import { useAppState } from "../states/app"
import {
  isDisclaimerUnderstood,
  understandDisclaimer,
} from "../utils/disclaimer"
import {
  getAccounts,
  hasActiveSession,
  isInitialized,
} from "../utils/messaging"
import { recover } from "../utils/recovery"

export const useEntry = () => {
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
  const { initialized, hasLegacy } = await isInitialized()
  if (!initialized) {
    if (hasLegacy) {
      return routes.legacy()
    }

    if (!isDisclaimerUnderstood()) {
      const accounts = await getAccounts()
      if (accounts.length > 0) {
        understandDisclaimer()
        return routes.welcome()
      }
      return routes.disclaimer()
    }

    return routes.welcome()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    return recover()
  }
  return routes.lockScreen()
}
