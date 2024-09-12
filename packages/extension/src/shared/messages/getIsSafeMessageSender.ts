import browser from "webextension-polyfill"

import { getOriginFromSender } from "./getOriginFromSender"

export function getIsSafeMessageSender(sender: browser.runtime.MessageSender) {
  const extensionUrl = browser.runtime.getURL("")
  const safeOrigin = extensionUrl.replace(/\/$/, "")
  const senderOrigin = getOriginFromSender(sender)
  const isSafeOrigin = Boolean(senderOrigin === safeOrigin)
  return isSafeOrigin
}
