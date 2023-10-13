import * as fs from "fs"
import path from "path"

import { Browser, Page, TestInfo, test as testBase } from "@playwright/test"

import config from "./config"
import { TestPages } from "./fixtures"
import WebWalletPage from "./page-objects/WebWalletPage"

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
let pageId = 0

async function createContext({
  browser,
  baseURL,
  name,
  testInfo,
}: {
  browser: Browser
  baseURL: string
  name: string
  testInfo: TestInfo
}) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    recordVideo: process.env.CI
      ? {
          dir: config.artifactsDir,
          size: {
            width: 1366,
            height: 768,
          },
        }
      : undefined,
    baseURL,
    viewport: { width: 1366, height: 768 },
  })
  context.on("page", async (page) => {
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
        const filename = `${testInfo.retry}-${name}-${
          testInfo.status
        }-${pageId++}-${testInfo.workerIndex}.webm`

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

  await context.addInitScript("window.PLAYWRIGHT = true;")
  return context
}

function createPage() {
  return async (
    { browser }: { browser: Browser },
    use: any,
    testInfo: TestInfo,
  ) => {
    const url = config.url

    const context = await createContext({
      browser,
      testInfo,
      name: "WebWallet",
      baseURL: url,
    })
    const page = await context.newPage()

    const webWalletPage = new WebWalletPage(page)
    await webWalletPage.open()
    await keepArtifacts(testInfo, page)
    await use(webWalletPage)
    await context.close()
  }
}
const test = testBase.extend<TestPages>({
  webWallet: createPage(),
})

export default test
