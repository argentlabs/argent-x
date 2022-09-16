import browser from "webextension-polyfill"

import { routes } from "../ui/routes"

export const openFullscreenOnboarding = () => {
  browser.tabs.create({
    url: browser.runtime.getURL(routes.onboardingStart()),
  })
}

export const initOnboarding = () => {
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
      openFullscreenOnboarding()
    }
  })
}
