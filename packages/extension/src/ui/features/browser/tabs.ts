import { isNumber } from "lodash-es"
import { useCallback, useEffect, useState } from "react"
import browser from "webextension-polyfill"

export const openExtensionInTab = async () => {
  const url = browser.runtime.getURL("index.html")
  const tab = await browser.tabs.create({ url })
  return tab
}

export const extensionIsInTab = async () => {
  return Boolean(await browser.tabs.getCurrent())
}

export const focusExtensionTab = async () => {
  const tab = await browser.tabs.getCurrent()
  if (tab && isNumber(tab?.id) && tab?.id !== browser.tabs.TAB_ID_NONE) {
    browser.tabs.update(tab.id, { active: true })
  }
}

/** Focus the extension if it is running in a tab  */
export const useFocusExtensionIfInTab = () => {
  const extensionIsInTab = useExtensionIsInTab()
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    init()
  }, [extensionIsInTab])
}

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false)
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab()
      setIsInTab(inTab)
    }
    init()
  }, [])
  return isInTab
}

export const useOpenExtensionInTab = () => {
  return useCallback(async () => {
    await openExtensionInTab()
    window.close()
  }, [])
}
