import browser from "webextension-polyfill"

export const initOnboarding = () => {
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
      const url = browser.runtime.getURL("index.html")
      browser.tabs.create({ url })
    }
  })
}
