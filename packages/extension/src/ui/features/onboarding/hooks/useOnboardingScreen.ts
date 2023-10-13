import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAppState } from "../../../app.state"
import { routes } from "../../../routes"
import { extensionIsInTab, openExtensionInTab } from "../../browser/tabs"
import { isBackupStoredView } from "../../../views/session"
import { useView } from "../../../views/implementation/react"

/**
 * This hook is used to redirect to the finish screen if the wallet is already initialised
 * It also checks if the extension is in a tab, if not, it opens it in a tab
 *
 * @dev This hook should be called on every screen of the onboarding
 * @returns void
 */
export const useOnboardingScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isFirstRender } = useAppState()
  const isBackupStored = useView(isBackupStoredView)

  // TODO: this should not be nessessary, instead of pulling a value on focus, the UI should react to changes in real time by subscribing to the store
  useEffect(() => {
    /** on window focus, check if the wallet was initialised elsewhere and redirect to finish screen */
    const onFocus = async () => {
      if (
        isBackupStored &&
        isFirstRender &&
        location.pathname !== routes.onboardingFinish.path &&
        location.pathname !== routes.onboardingRestorePassword.path // feels very hacky this useEffect here, need to find something more sustainable
      ) {
        navigate(routes.onboardingFinish.path, { replace: true })
      }
    }
    window.addEventListener("focus", onFocus)
    onFocus()
    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [location.pathname, navigate, isFirstRender, isBackupStored])

  // NOTE: check if extension is in a tab, if not, open it in a tab
  const didRunInit = useRef(false)
  useEffect(() => {
    const init = async () => {
      /** prevent opening more than once when useEffect is called multiple times in dev */
      if (!didRunInit.current) {
        didRunInit.current = true
        /** When user clicks extension icon, open onboarding in full screen */
        const inTab = await extensionIsInTab()
        if (!inTab) {
          /** Note: cannot detect and focus an existing extension tab here, so open a new one */
          await openExtensionInTab()
          window.close()
        }
      }
    }
    init()
  }, [isFirstRender])
}
