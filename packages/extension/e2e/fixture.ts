import "isomorphic-fetch"

import path from "path"

import { test as base, chromium, firefox, webkit } from "@playwright/test"

export const test = base.extend({
  context: async ({ browserName }, use, { workerIndex }) => {
    console.log("[INFO] Extending browser context")
    const browserTypes = { chromium, firefox, webkit }
    const extensionPath = path.join(__dirname, "../dist/")
    const context = await browserTypes[browserName].launchPersistentContext(
      `/tmp/e2e-argent-x-${workerIndex}-${Date.now()}`, // Date.now() is to avoid sharing sessions between tests
      {
        headless: false,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
        ],
      },
    )
    await use(context)
    await context.close()
  },
})
