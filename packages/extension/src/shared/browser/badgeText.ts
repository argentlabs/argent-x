import browser from "webextension-polyfill"

/** browserAction is v2 API, action is v3 */

const action = browser.browserAction || browser.action

export const showNotificationBadge = (text: string | number) => {
  action.setBadgeText({
    text: String(text),
  })
  action.setBadgeBackgroundColor({ color: "#29C5FF" })
}

export const hideNotificationBadge = () => {
  showNotificationBadge("")
}
