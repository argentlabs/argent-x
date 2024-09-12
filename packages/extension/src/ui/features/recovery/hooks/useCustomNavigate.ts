import { NavigateOptions, To, useNavigate } from "react-router-dom"
import browser from "webextension-polyfill"

import { routes } from "../../../../shared/ui/routes"
import { extensionIsInTab, openExtensionInTab } from "../../browser/tabs"

const getPlatformOS = async () => {
  const info = await browser.runtime.getPlatformInfo()
  return info.os
}

export const useCustomNavigate = () => {
  const navigate = useNavigate()

  return async (to: To, options?: NavigateOptions) => {
    const isLinux = (await getPlatformOS()) === "linux"
    const isAlreadyInTab = await extensionIsInTab()

    if (to === routes.onboardingRestoreBackup() && isLinux && !isAlreadyInTab) {
      return openExtensionInTab()
    }
    return navigate(to, options)
  }
}
