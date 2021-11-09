import browser from "webextension-polyfill"
import { Messenger } from "./utils/Messenger"

browser.runtime.onConnect.addListener(function (port) {
  if (port.name !== "argent-x") return

  const messenger = new Messenger(
    (emit) => {
      port.onMessage.addListener((data) => {
        console.log(data)
        if (data.from && data.type && data.from == "INPAGE") {
          const { type, evData } = data
          emit(type, evData)
        }
      })
    },
    (type, data) => {
      port.postMessage({ from: "BACKGROUND", type, data })
    },
  )

  const NOTIFICATION_WIDTH = 322
  const NOTIFICATION_HEIGHT = 610

  console.log("listening")

  messenger.listen(async (type, data) => {
    console.log("BACKGROUND", type, data)
    switch (type) {
      case "OPEN_UI":
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
        browser.windows.create({
          url: "index.html",
          type: "popup",
          width: NOTIFICATION_WIDTH,
          height: NOTIFICATION_HEIGHT,
          left,
          top,
        })
        break

      default:
        break
    }
  })
})
