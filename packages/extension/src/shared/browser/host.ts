import browser from "webextension-polyfill"

export const getWindowURL = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })
  if (tabs.length) {
    const tab = tabs[0]
    if (tab.url) {
      const url = new URL(tab.url)
      return url
    }
  }
}

/**
 * @returns the equivalent of `window.location.host` for the active tab
 * @note this will return the extension URL when inside a popup
 */

export const getWindowLocationHost = async () => {
  const url = await getWindowURL()
  if (!url) {
    return
  }
  return url.host
}
