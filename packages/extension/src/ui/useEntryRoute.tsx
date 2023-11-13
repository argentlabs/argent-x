import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { delay } from "../shared/utils/delay"
import { IS_DEV } from "../shared/utils/dev"
import { useAppState } from "./app.state"
import { recover } from "./features/recovery/recovery.service"
import { routes } from "./routes"
import { getInitialHardReloadRoute } from "./services/resetAndReload"
import { useView } from "./views/implementation/react"
import { isPasswordSetView, isBackupStoredView } from "./views/session"

export const useEntryRoute = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()
  const isBackupStored = useView(isBackupStoredView)
  const isPasswordSet = useView(isPasswordSetView)

  useEffect(() => {
    void (async () => {
      if (isFirstRender) {
        const query = new URLSearchParams(window.location.search)
        const entry = await determineEntry(query, isBackupStored, isPasswordSet)
        useAppState.setState({ isLoading: false, isFirstRender: false })
        navigate(entry, { replace: true })
        if (IS_DEV) {
          const initialRoute = getInitialHardReloadRoute(query)
          if (initialRoute) {
            await delay(0)
            navigate(initialRoute, { replace: true })
          }
        }
      }
    })()
  }, [isFirstRender, navigate, isBackupStored, isPasswordSet])
}

const determineEntry = async (
  query: URLSearchParams,
  isBackupStored: boolean,
  isPasswordSet: boolean,
) => {
  if (query.get("goto") === "background-error") {
    return routes.backgroundError()
  }

  if (query.get("goto") === "ledger") {
    return routes.ledgerEntry()
  }

  if (query.get("goto") === "multisig") {
    const networkId = query.get("networkId")
    if (!networkId) {
      throw new Error("Missing networkId query param")
    }
    return routes.multisigCreate(networkId)
  }

  if (!isBackupStored) {
    return routes.onboardingStart()
  }

  if (isPasswordSet) {
    return recover()
  }
  return routes.lockScreen()
}
