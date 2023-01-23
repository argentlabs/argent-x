import path from "path"

import { ChromiumBrowserContext, Page, test } from "@playwright/test"

import config from "./config"
import ExtensionPage from "./page-objects/ExtensionPage"
import { closePages, initBrowserWithExtension } from "./util"

let page: Page
let browserContext: ChromiumBrowserContext
let extensionURL: string
let extension: ExtensionPage

test.beforeAll(async () => {
  const init = await initBrowserWithExtension()
  browserContext = init.browserContext
  extensionURL = init.extensionURL
  page = init.page
})
/*
test.afterAll(async () => {
  await browserContext?.close()
  extensionURL = ""
})
*/
test.beforeEach(async () => {
  if (!extensionURL) {
    console.error("Invalid extensionURL", { extensionURL })
  }
  await page.bringToFront()
  await page.goto(extensionURL)
  await page.waitForTimeout(1000)
  await closePages(browserContext)
  extension = new ExtensionPage(page, extensionURL)
})
let pageId = 0

test.afterEach(async ({}, testInfo) => {
  if (
    testInfo.config.preserveOutput === "always" ||
    (testInfo.config.preserveOutput === "failures-only" &&
      testInfo.status === "failed") ||
    testInfo.status === "timedOut"
  ) {
    const folder = testInfo.title.replace(/\s+/g, "_").replace(/\W/g, "")
    const filename = `${testInfo.retry}-${testInfo.status}-${pageId++}-${
      testInfo.workerIndex
    }.webm`

    page
      .video()
      ?.saveAs(path.resolve(config.artifactsDir, folder, filename))
      .catch((error) => {
        console.error(error)
      })
  }
  page
    .video()
    ?.delete()
    .catch((error) => {
      console.error(error)
    })
  await closePages(browserContext)
})

export { test, extension }
