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
