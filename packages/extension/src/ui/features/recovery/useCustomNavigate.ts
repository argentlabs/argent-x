import { NavigateOptions, To, useNavigate } from "react-router-dom"
import browser from "webextension-polyfill"

import { routes } from "../../routes"

const openExtensionInTab = () => {
  const url = browser.runtime.getURL("index.html")
  return browser.tabs.create({ url })
}

export const isInTab = async () => {
  return Boolean(await browser.tabs.getCurrent())
}

const getPlatformOS = async () => {
  const info = await browser.runtime.getPlatformInfo()
  return info.os
}

export const useCustomNavigate = () => {
  const navigate = useNavigate()

  return async (to: To, options?: NavigateOptions) => {
    const isLinux = (await getPlatformOS()) === "linux"
    const isAlreadyInTab = await isInTab()

    if (to === routes.backupRecovery() && isLinux && !isAlreadyInTab) {
      return openExtensionInTab()
    }
    return navigate(to, options)
  }
}
