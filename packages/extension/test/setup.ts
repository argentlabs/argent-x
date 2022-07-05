import fetch from "cross-fetch"
import { chrome } from "jest-chrome"

try {
  global.fetch = fetch
} catch {
  // do nothing
}
try {
  window.fetch = fetch
} catch {
  // do nothing
}
try {
  ;(window as any).chrome = chrome
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ;(window as any).chrome.runtime.id = "test"
} catch {
  // do nothing
}
