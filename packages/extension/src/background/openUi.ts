import browser from "webextension-polyfill"

const NOTIFICATION_WIDTH = 322
const NOTIFICATION_HEIGHT = 610

// TODO: remove this workaround once the new action queue system is in place
function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function openUi() {
  const [existingPopup] = await browser.tabs.query({
    url: browser.runtime.getURL("/index.html"),
  })

  if (existingPopup && existingPopup.windowId)
    return browser.windows.update(existingPopup.windowId, { focused: true })

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
  await wait(300)
  const popup = await browser.windows.create({
    url: "index.html",
    type: "popup",
    width: NOTIFICATION_WIDTH,
    height: NOTIFICATION_HEIGHT,
    left,
    top,
  })

  return popup
}
