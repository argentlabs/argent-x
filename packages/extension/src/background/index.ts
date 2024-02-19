import * as Sentry from "@sentry/browser"
import browser from "webextension-polyfill"

import { getBrowserAction } from "../shared/browser"
import { sentryWorker } from "./__new/services/sentry"

try {
  // Try to start Sentry immediately
  initSentryWorker()
} catch (error) {
  console.error("Exception while initialising sentryWorker", error)
}

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

// Prevent tree-shaking unused worker variables
function initSentryWorker() {
  return {
    sentryWorker,
  }
}
