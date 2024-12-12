import type browser from "webextension-polyfill"

export function getOriginFromSender(
  sender: browser.runtime.MessageSender,
): string {
  const url = sender.origin ?? sender.url
  if (!url) {
    throw new Error("Message sender has no origin or url")
  }
  const { origin } = new URL(url) // Firefox uses url, Chrome uses origin
  return origin
}
