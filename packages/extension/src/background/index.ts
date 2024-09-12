import { initAmplitude } from "../shared/analytics/init"
import browser from "webextension-polyfill"

import { getBrowserAction } from "../shared/browser"
import { sentryWorker } from "./services/sentry"
import { browserExtensionSentryScope } from "../shared/sentry/scope"

try {
  // Try to start Sentry immediately
  initSentryWorker()
} catch (error) {
  console.error("Exception while initialising sentryWorker", error)
}

try {
  initAmplitude().catch((error) => {
    console.error("Error loading amplitude", error)
  })
} catch (e) {
  console.error("Error loading ampli", e)
}

try {
  // catch any errors from init.ts
  require("./init")
} catch (error) {
  console.error("Fatal exception in background/init.ts", error)
  browserExtensionSentryScope.captureException(error)
  // run on next event loop to override changes by any successful services
  setTimeout(() => {
    // clicking icon will start on the error screen
    void getBrowserAction(browser).setPopup({
      popup: "index.html?goto=background-error",
    })
  }, 0)
}

function initSentryWorker() {
  return {
    sentryWorker,
  }
}
