import { ChromiumBrowserContext, chromium } from "@playwright/test"

import config from "./config"

export const EXTENSION_PATH = config.distDir

export const isExtensionURL = (url: string) =>
  url.startsWith("chrome-extension://")

export const closePages = async (browserContext: ChromiumBrowserContext) => {
  const pages = browserContext?.pages() || []
  for (const page of pages) {
    const url = page.url()
    if (!isExtensionURL(url)) {
      await page.close()
    }
  }
}
export const initBrowserWithExtension = async () => {
  const userDataDir = `/tmp/test-user-data-${Math.random()}`
  const browserContext = (await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      "--disable-dev-shm-usage",
      "--ipc=host",
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
    recordVideo: {
      dir: config.artifactsDir,
      size: {
        width: 800,
        height: 600,
      },
    },
  })) as ChromiumBrowserContext

  await browserContext.addInitScript("window.PLAYWRIGHT = true;")
  await browserContext.addInitScript(() => {
    window.localStorage.setItem(
      "seenNetworkStatusState",
      `{"state":{"lastSeen":${Date.now()}},"version":0}`, // tricks the extension into not showing the warning as it thinks it's been seen
    )
  })

  let page = browserContext.pages()[0]
  await page.emulateMedia({ reducedMotion: "reduce" })

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

  return { browserContext, extensionURL, page }
}
