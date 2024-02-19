import {
  artifactsDir,
  isKeepArtifacts,
  keepVideos,
  saveHtml,
} from "../../shared/cfg/test"

import {
  BrowserContext,
  Browser,
  TestInfo,
  test as testBase,
} from "@playwright/test"

import config from "../../shared/config"
import { TestPages } from "./fixtures"
import WebWalletPage from "./page-objects/WebWalletPage"

let browserCtx: BrowserContext

async function createContext({
  browser,
  baseURL,
}: {
  browser: Browser
  baseURL: string
  name: string
  testInfo: TestInfo
}) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    recordVideo: {
      dir: artifactsDir,
      size: {
        width: 1366,
        height: 768,
      },
    },
    baseURL,
    viewport: { width: 1366, height: 768 },
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
    browserCtx = context
    await use(webWalletPage)
    const keepArtifacts = isKeepArtifacts(testInfo)
    if (keepArtifacts) {
      await saveHtml(testInfo, page, "WebWallet")
      await context.close()
      await keepVideos(testInfo, page, "WebWallet")
    } else {
      await context.close()
    }
  }
}
function getContext() {
  return async ({}, use: any, _testInfo: TestInfo) => {
    await use(browserCtx)
  }
}

const test = testBase.extend<TestPages>({
  webWallet: createPage(),
  browserContext: getContext(),
})

export default test
