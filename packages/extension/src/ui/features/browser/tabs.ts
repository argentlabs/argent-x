import { isNumber } from "lodash-es"
import { useCallback, useEffect, useState } from "react"
import browser from "webextension-polyfill"

export const openExtensionInTab = async (route = "") => {
  let path = "index.html"
  if (route !== "") {
    path += `?route=${route}`
  }
  const url = browser.runtime.getURL(path)
  console.log(url)
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

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false)
  console.log("PRE INNER", isInTab)
  useEffect(() => {
    const init = async () => {
      console.log("PRE")
      const inTab = await extensionIsInTab()
      console.log("POST", inTab)
      setIsInTab(inTab)
    }
    init()
  }, [])
  console.log("POST INNER", isInTab)
  return isInTab
}

export const useOpenExtensionInTab = (route = "") => {
  return useCallback(async () => {
    await openExtensionInTab(route)
    window.close()
  }, [route])
}
