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
import config from "./config"
import { logInfo } from "./utils"
import path from "path"
import fs from "fs-extra"

declare global {
  interface Window {
    PLAYWRIGHT?: boolean
  }
}
const outputFolder = (testInfo: TestInfo) =>
  testInfo.title.replace(/\s+/g, "_").replace(/\W/g, "")
const artifactFilename = (testInfo: TestInfo, label: string) =>
  `${testInfo.retry}-${testInfo.status}-${label}-${testInfo.workerIndex}`
const isKeepArtifacts = (testInfo: TestInfo) =>
  testInfo.config.preserveOutput === "always" ||
  (testInfo.config.preserveOutput === "failures-only" &&
    testInfo.status === "failed") ||
  testInfo.status === "timedOut"

const artifactSetup = async (testInfo: TestInfo, label: string) => {
  await fs.promises
    .mkdir(path.resolve(config.artifactsDir, outputFolder(testInfo)), {
      recursive: true,
    })
    .catch((error) => {
      console.error({ op: "artifactSetup", error })
    })
  return artifactFilename(testInfo, label)
}

const saveHtml = async (testInfo: TestInfo, page: Page, label: string) => {
  logInfo({
    op: "saveHtml",
    label,
  })
  const fileName = await artifactSetup(testInfo, label)
  const htmlContent = await page.content()
  await fs.promises
    .writeFile(
      path.resolve(
        config.artifactsDir,
        outputFolder(testInfo),
        `${fileName}.html`,
      ),
      htmlContent,
    )
    .catch((error) => {
      console.error({ op: "saveHtml", error })
    })
}

const keepVideos = async (testInfo: TestInfo, page: Page, label: string) => {
  logInfo({
    op: "keepVideos",
    label,
  })
  const fileName = await artifactSetup(testInfo, label)
  await page
    .video()
    ?.saveAs(
      path.resolve(
        config.artifactsDir,
        outputFolder(testInfo),
        `${fileName}.webm`,
      ),
    )
    .catch((error) => {
      console.error({ op: "keepVideos", error })
    })
}

const isExtensionURL = (url: string) => url.startsWith("chrome-extension://")
let browserCtx: ChromiumBrowserContext
const closePages = async (browserContext: ChromiumBrowserContext) => {
  const pages = browserContext?.pages() || []
  for (const page of pages) {
    if (!isExtensionURL(page.url())) {
      await page.close()
    }
  }
}

const createBrowserContext = async (userDataDir: string, buildDir: string) => {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      "--disable-dev-shm-usage",
      "--ipc=host",
      `--disable-extensions-except=${buildDir}`,
      `--load-extension=${buildDir}`,
    ],
    viewport: config.viewportSize,
    ignoreDefaultArgs: ["--disable-component-extensions-with-background-pages"],
    recordVideo: {
      dir: config.artifactsDir,
      size: config.viewportSize,
    },
  })
  await context.addInitScript(() => {
    window.PLAYWRIGHT = true
    window.localStorage.setItem(
      "seenNetworkStatusState",
      JSON.stringify({ state: { lastSeen: Date.now() }, version: 0 }),
    )
    window.localStorage.setItem("onboardingExperiment", "E1A1")
  })
  return context
}

const initBrowserWithExtension = async (
  userDataDir: string,
  buildDir: string,
) => {
  const browserContext = await createBrowserContext(userDataDir, buildDir)
  const page = await browserContext.newPage()

  await page.bringToFront()
  await page.goto("chrome://extensions")
  await page.locator('[id="devMode"]').click()
  const extensionId = await page
    .locator('[id="extension-id"]')
    .first()
    .textContent()
    .then((text) => text?.replace("ID: ", ""))

  const extensionURL = `chrome-extension://${extensionId}/index.html`
  await page.goto(extensionURL)
  await page.waitForTimeout(500)

  await page.emulateMedia({ reducedMotion: "reduce" })
  return { browserContext, extensionURL, page }
}

function createExtension(label: string, upgrade: boolean = false) {
  return async ({}, use: any, testInfo: TestInfo) => {
    const userDataDir = `/tmp/test-user-data-${uuid()}`
    let buildDir = config.distDir
    if (upgrade) {
      fs.copy(buildDir, config.migVersionDir)
      buildDir = config.migVersionDir
    }
    const { browserContext, page, extensionURL } =
      await initBrowserWithExtension(userDataDir, buildDir)
    process.env.workerIndex = testInfo.workerIndex.toString()
    const extension = new ExtensionPage(page, extensionURL, upgrade)
    await closePages(browserContext)
    browserCtx = browserContext
    await use(extension)

    if (isKeepArtifacts(testInfo)) {
      await saveHtml(testInfo, page, label)
      await keepVideos(testInfo, page, label)
    }
    await browserContext.close()
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
  upgradeExtension: createExtension("upgradeExtension", true),
})

export default test
