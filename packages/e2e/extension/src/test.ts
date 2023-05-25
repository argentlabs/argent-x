import * as fs from "fs"
import path from "path"

import {
  ChromiumBrowserContext,
  Page,
  TestInfo,
  chromium,
  test as testBase,
} from "@playwright/test"

import config from "./config"
import type { TestExtensions } from "./fixtures"
import ExtensionPage from "./page-objects/ExtensionPage"

const isExtensionURL = (url: string) => url.startsWith("chrome-extension://")

const closePages = async (browserContext: ChromiumBrowserContext) => {
  const pages = browserContext?.pages() || []
  for (const page of pages) {
    const url = page.url()
    if (!isExtensionURL(url)) {
      await page.close()
    }
  }
}

const keepArtifacts = async (testInfo: TestInfo, page: Page) => {
  if (
    testInfo.config.preserveOutput === "always" ||
    (testInfo.config.preserveOutput === "failures-only" &&
      testInfo.status !== "passed")
  ) {
    //save HTML
    const folder = testInfo.title.replace(/\s+/g, "_").replace(/\W/g, "")
    const filename = `${testInfo.retry}-${testInfo.status}-${pageId}-${testInfo.workerIndex}.html`
    try {
      const htmlContent = await page.content()
      await fs.promises
        .mkdir(path.resolve(config.artifactsDir, folder), { recursive: true })
        .catch((error) => {
          console.error(error)
        })
      await fs.promises
        .writeFile(
          path.resolve(config.artifactsDir, folder, filename),
          htmlContent,
        )
        .catch((error) => {
          console.error(error)
        })
    } catch (error) {
      console.error("Error while saving HTML content", error)
    }
  }
}
const initBrowserWithExtension = async (testInfo: TestInfo) => {
  const userDataDir = `/tmp/test-user-data-${Math.round(
    new Date().getTime() / 1000,
  )}-${(Math.random() + 1).toString(36).substring(7)}-${testInfo.workerIndex}`
  const browserContext = (await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      "--disable-dev-shm-usage",
      "--ipc=host",
      `--disable-extensions-except=${config.distDir}`,
      `--load-extension=${config.distDir}`,
    ],
    recordVideo: {
      dir: config.artifactsDir,
      size: {
        width: 800,
        height: 600,
      },
    },
  })) as ChromiumBrowserContext

  // save video
  browserContext.on("page", async (page) => {
    page.on("load", async (page) => {
      try {
        await page.title()
      } catch (err) {
        console.warn(err)
      }
    })

    page.on("close", async (page) => {
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

        await page
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
    })
  })

  await browserContext.addInitScript("window.PLAYWRIGHT = true;")
  await browserContext.addInitScript(() => {
    window.localStorage.setItem(
      "seenNetworkStatusState",
      `{"state":{"lastSeen":${Date.now()}},"version":0}`, // tricks the extension into not showing the warning as it thinks it's been seen
    )
  })

  let page = browserContext.pages()[0]

  await page.bringToFront()
  await page.goto("chrome://inspect/#extensions")
  const url = await page
    .locator('#pages-list div[class="url"]:has-text("chrome-extension://")')
    .textContent()
  if (!url || !url.split("/")[2]) {
    throw new Error("Invalid extension URL")
  }
  const extensionId = url.split("/")[2]
  const extensionURL = `chrome-extension://${extensionId}/index.html`
  await page.waitForTimeout(500)
  const pages = browserContext.pages()

  const extPage = pages.find((x) => x.url() === extensionURL)
  if (extPage) {
    page = extPage
  }
  if (!page) {
    page = pages[0]
  }

  await page.emulateMedia({ reducedMotion: "reduce" })

  return { browserContext, extensionURL, page }
}

function createExtension() {
  return async ({}, use: any, testInfo: TestInfo) => {
    const { browserContext, page, extensionURL } =
      await initBrowserWithExtension(testInfo)
    const extension = new ExtensionPage(page, extensionURL)
    await keepArtifacts(testInfo, page)
    await closePages(browserContext)
    await use(extension)
    await browserContext.close()
  }
}
let pageId = 0
const test = testBase.extend<TestExtensions>({
  extension: createExtension(),
  secondExtension: createExtension(),
})

export default test
