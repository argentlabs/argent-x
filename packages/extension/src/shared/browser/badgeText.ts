import browser from "webextension-polyfill"

export const showNotificationBadge = (text: string | number) => {
  browser.browserAction.setBadgeText({
    text: String(text),
  })
  browser.browserAction.setBadgeBackgroundColor({ color: "#29C5FF" })
}

export const hideNotificationBadge = () => {
  showNotificationBadge("")
}
