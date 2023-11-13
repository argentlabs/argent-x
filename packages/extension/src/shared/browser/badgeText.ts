import browser from "webextension-polyfill"
import { getBrowserAction } from "../browser"

export const showNotificationBadge = (text: string | number) => {
  void getBrowserAction(browser).setBadgeText({
    text: String(text),
  })
  void getBrowserAction(browser).setBadgeBackgroundColor({ color: "#29C5FF" })
}

export const hideNotificationBadge = () => {
  showNotificationBadge("")
}
