import browser from "webextension-polyfill"
import * as Sentry from "@sentry/browser"
import { getBrowserAction } from "../shared/browser"

try {
  // catch any errors from init.ts
  require("./init")
} catch (error) {
  console.error("Fatal exception in background/init.ts", error)
  Sentry.captureException(error)
  // run on next event loop to override changes by any successful services
  setTimeout(() => {
    // clicking icon will start on the error screen
    void getBrowserAction(browser).setPopup({
      popup: "index.html?goto=background-error",
    })
  }, 0)
}
