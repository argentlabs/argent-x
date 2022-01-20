import { routes } from "../routes"
import { showDisclaimer } from "./disclaimer"
import { hasActiveSession, isInitialized } from "./messaging"
import { recover } from "./recovery"

export const determineEntry = async () => {
  const initialized = await isInitialized()
  if (!initialized) {
    if (showDisclaimer()) {
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
