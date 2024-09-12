import browser from "webextension-polyfill"

import {
  HOT_RELOAD_BACKGROUND_MESSAGE,
  HOT_RELOAD_PORT,
  IS_DEV,
} from "../../shared/utils/dev"

if (IS_DEV) {
  const ws = new WebSocket(`ws://localhost:${HOT_RELOAD_PORT}`)
  ws.addEventListener("message", (event) => {
    if (event.data === HOT_RELOAD_BACKGROUND_MESSAGE) {
      browser.runtime.reload()
    }
  })
}
