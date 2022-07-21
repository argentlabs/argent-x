import browser from "webextension-polyfill"

import { getWindowLocationHost } from "../shared/browser/host"

const NOTIFICATION_WIDTH = 360
const NOTIFICATION_HEIGHT = 600 + 28 // +28 for the title bar

let openUiPending: Promise<browser.windows.Window> | undefined

export async function openUi() {
  if (!openUiPending) {
    openUiPending = openPopup().finally(() => {
      openUiPending = undefined
    })
  }

  return openUiPending
}

async function openPopup() {
  const [existingPopup] = await browser.tabs.query({
    url: [browser.runtime.getURL("/*")],
  })

  if (existingPopup && existingPopup.windowId) {
    return browser.windows.update(existingPopup.windowId, { focused: true })
  }

  let left = 0
  let top = 0
  try {
    const lastFocused = await browser.windows.getLastFocused()

    // Position window in top right corner of lastFocused window.
    top = lastFocused.top ?? 0
    left =
      (lastFocused.left ?? 0) +
      Math.max((lastFocused.width ?? 0) - NOTIFICATION_WIDTH, 0)
  } catch (_) {
    // The following properties are more than likely 0, due to being
    // opened from the background chrome process for the extension that
    // has no physical dimensions
    const { screenX, screenY, outerWidth } = window
    top = Math.max(screenY, 0)
    left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0)
  }

  /** popup loses context of originating host so it is passed in query */
  const windowLocationHost = await getWindowLocationHost()
  const host = windowLocationHost ? encodeURIComponent(windowLocationHost) : ""
  const url = `index.html?popup&host=${host}`

  const popup = await browser.windows.create({
    url,
    type: "popup",
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    left,
    top,
  })

  return popup
}
