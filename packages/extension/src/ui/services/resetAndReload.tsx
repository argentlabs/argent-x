import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import browser from "webextension-polyfill"

import { resetDevice } from "../../shared/smartAccount/jwt"
import { delay } from "../../shared/utils/delay"
import { IS_DEV } from "../../shared/utils/dev"
import { useLegacyAppState } from "../app.state"

export interface ISoftReloadContext {
  key: string
  softReload: () => void
}

export const SoftReloadContext = createContext<ISoftReloadContext | null>(null)

export const useSoftReloadContext = () =>
  useContext(SoftReloadContext) as ISoftReloadContext

/** the key returned should be different each time, does not need to be a unique id */
const makeReloadKey = () => Date.now().toString()

const SoftReloadProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [key, setKey] = useState(makeReloadKey())

  const softReload = useCallback(() => {
    useLegacyAppState.setState({ isLoading: true })
    setKey(makeReloadKey())
  }, [])

  /** changing the key causes the children to re-render naturally */
  return (
    <SoftReloadContext.Provider value={{ key, softReload }}>
      <React.Fragment key={key}>{children}</React.Fragment>
    </SoftReloadContext.Provider>
  )
}

export default SoftReloadProvider

/** re-render the component tree by changing the `key`, without re-loading the HTML page */
export const useSoftReload = () => {
  const { softReload } = useSoftReloadContext()
  return softReload
}

/**
 * re-load the HTML page
 *
 * @param resetRoute - if `false` and in development mode only, will try to reinstate the current route after reload
 */

export const hardReload = (resetRoute = true) => {
  if (typeof window === "undefined") {
    return
  }
  const url = browser.runtime.getURL("index.html")
  const shouldResetRoute = !IS_DEV || resetRoute
  window.location.href = shouldResetRoute
    ? url
    : `${url}?initialHardReloadRoute=${encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      )}`
}

export const useHardReload = (resetRoute = true) => {
  return useCallback(() => {
    hardReload(resetRoute)
  }, [resetRoute])
}

export const getInitialHardReloadRoute = (query: URLSearchParams) => {
  const initialRoute = query.get("initialHardReloadRoute")
  return initialRoute
}

/** reset local storage while preserving some UI state */

export const RESET_CACHE_OMIT_KEYS = ["backupDownload", "networkStatuses-all"]

export const useResetCache = () => {
  return useCallback(async () => {
    const clearKeys = Object.keys(localStorage).filter(
      (key) => !RESET_CACHE_OMIT_KEYS.includes(key),
    )
    clearKeys.forEach((key) => localStorage.removeItem(key))
    await resetDevice()
  }, [])
}

/** reset and reload combo */
export const useHardResetAndReload = () => {
  const resetCache = useResetCache()
  const hardReload = useHardReload()
  return useCallback(async () => {
    resetCache()
    // delay should allow state to persist
    await delay(100)
    hardReload()
  }, [hardReload, resetCache])
}
