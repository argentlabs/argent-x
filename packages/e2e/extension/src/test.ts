import {
  artifactsDir,
  isCI,
  isKeepArtifacts,
  keepVideos,
  saveHtml,
} from "../../shared/cfg/test"
import path from "path"
import {
  ChromiumBrowserContext,
  Page,
  TestInfo,
  chromium,
  test as testBase,
} from "@playwright/test"
import { v4 as uuid } from "uuid"
import type { TestExtensions } from "./fixtures"
import ExtensionPage from "./page-objects/ExtensionPage"

const isExtensionURL = (url: string) => url.startsWith("chrome-extension://")
let browserCtx: ChromiumBrowserContext
const distDir = path.join(__dirname, "../../../extension/dist/")

const closePages = async (browserContext: ChromiumBrowserContext) => {
  const pages = browserContext?.pages() || []
  for (const page of pages) {
    const url = page.url()
    if (!isExtensionURL(url)) {
      await page.close()
    }
  }
}

const createBrowserContext = () => {
  const userDataDir = `/tmp/test-user-data-${uuid()}`
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `${isCI ? "--headless=new" : ""}`,
      "--disable-dev-shm-usage",
      "--ipc=host",
      `--disable-extensions-except=${distDir}`,
      `--load-extension=${distDir}`,
      "--disable-gpu",
    ],
    ignoreDefaultArgs: ["--disable-component-extensions-with-background-pages"],
    screen: {
      width: 300,
      height: 600,
    },
    recordVideo: {
      dir: artifactsDir,
      size: {
        width: 1080,
        height: 720,
      },
    },
  })
}

const initBrowserWithExtension = async () => {
  const browserContext = await createBrowserContext()
  await browserContext.addInitScript("window.PLAYWRIGHT = true;")
  await browserContext.addInitScript(() => {
    window.localStorage.setItem(
      "seenNetworkStatusState",
      `{"state":{"lastSeen":${Date.now()}},"version":0}`, // tricks the extension into not showing the warning as it thinks it's been seen
    )
  })

  await browserContext.addInitScript(() => {
    window.localStorage.setItem("onboardingExperiment", "E1A1")
  })

  let page: Page = browserContext.pages()[0]

  await page.bringToFront()
  await page.goto("chrome://extensions")
  await page.locator('[id="devMode"]').click()
  const extensionId = (
    await page.locator('[id="extension-id"]').first().textContent()
  )?.replace("ID: ", "")

  const extensionURL = `chrome-extension://${extensionId}/index.html`
  const pages = browserContext.pages()
  await page.goto(extensionURL)
  await page.waitForTimeout(500)

  const extPage = pages.find(
    (x: { url: () => string }) => x.url() === extensionURL,
  )
  if (extPage) {
    page = extPage
  }
  if (!page) {
    page = pages[0]
  }

  await page.emulateMedia({ reducedMotion: "reduce" })

  /*const ex = await browserContext.addInitScript(() => {
    window.localStorage.getItem("onboardingExperiment")
  })
  console.log('token previous', ex)

  await browserContext.addInitScript((storage) => {
    storage.setItem("onboardingExperiment", "E1A1")
  })
   const ex2 = await browserContext.addInitScript(() => {
    window.localStorage.getItem("onboardingExperiment")
  })
  console.log('token after', ex2)*/
  return { browserContext, extensionURL, page }
}

function createExtension(label: string) {
  return async ({}, use: any, testInfo: TestInfo) => {
    const { browserContext, page, extensionURL } =
      await initBrowserWithExtension()

    const extension = new ExtensionPage(page, extensionURL)
    await closePages(browserContext)
    browserCtx = browserContext
    await use(extension)
    const keepArtifacts = isKeepArtifacts(testInfo)
    if (keepArtifacts) {
      await saveHtml(testInfo, page, label)
      await browserContext.close()
      await keepVideos(testInfo, page, label)
    } else {
      await browserContext.close()
    }
  }
}

function getContext() {
  return async ({}, use: any, _testInfo: TestInfo) => {
    await use(browserCtx)
  }
}

const test = testBase.extend<TestExtensions>({
  extension: createExtension("extension"),
  secondExtension: createExtension("secondExtension"),
  thirdExtension: createExtension("thirdExtension"),
  browserContext: getContext(),
})

export default test
