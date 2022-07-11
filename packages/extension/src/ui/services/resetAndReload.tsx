import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import browser from "webextension-polyfill"

import { delay } from "../../shared/utils/delay"
import { useAppState } from "../app.state"

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
    useAppState.setState({ isLoading: true, isFirstRender: true })
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

/** re-load the HTML page, can have some side-effects including localStorage+SWR state pollution */
export const useHardReload = () => {
  return useCallback(() => {
    const url = browser.runtime.getURL("index.html")
    window.location.href = url
  }, [])
}

/** reset local storage while preserving some UI state */

export const RESET_CACHE_OMIT_KEYS = ["backupDownload", "networkStatuses-all"]

export const useResetCache = () => {
  return useCallback(() => {
    const clearKeys = Object.keys(localStorage).filter(
      (key) => !RESET_CACHE_OMIT_KEYS.includes(key),
    )
    clearKeys.forEach((key) => localStorage.removeItem(key))
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
