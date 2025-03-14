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
import DappPage from "./page-objects/DappPage"

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

const handleFileError = (operation: string) => (error: Error) => {
  console.error({ op: operation, error })
}

const artifactSetup = async (testInfo: TestInfo, label: string) => {
  await fs.promises
    .mkdir(path.resolve(config.artifactsDir, outputFolder(testInfo)), {
      recursive: true,
    })
    .catch(handleFileError("artifactSetup"))
  return artifactFilename(testInfo, label)
}

const getArtifactPath = (
  testInfo: TestInfo,
  label: string,
  extension: string,
) =>
  path.resolve(
    config.artifactsDir,
    outputFolder(testInfo),
    `${artifactFilename(testInfo, label)}.${extension}`,
  )

type ArtifactOperation = "html" | "video" | "screenshot"
type ArtifactSaveFunction = (
  testInfo: TestInfo,
  page: Page,
  label: string,
) => Promise<void>

const artifactHandlers: Record<ArtifactOperation, ArtifactSaveFunction> = {
  html: async (testInfo, page, label) => {
    await fs.promises.writeFile(
      getArtifactPath(testInfo, label, "html"),
      await page.content(),
    )
  },
  video: async (testInfo, page, label) => {
    const video = page.video()
    if (video) {
      await video.saveAs(getArtifactPath(testInfo, label, "webm"))
    }
  },
  screenshot: async (testInfo, page, label) => {
    await page.screenshot({
      path: getArtifactPath(testInfo, label, "png"),
    })
  },
}

const saveArtifact = async (
  testInfo: TestInfo,
  page: Page,
  label: string,
  operation: ArtifactOperation,
) => {
  logInfo({ op: operation, label })
  await artifactSetup(testInfo, label)
  try {
    await artifactHandlers[operation](testInfo, page, label)
  } catch (error) {
    console.error({
      op: operation,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

const extensionInitScript = () => {
  window.PLAYWRIGHT = true
  window.localStorage.setItem(
    "seenNetworkStatusState",
    JSON.stringify({ state: { lastSeen: Date.now() }, version: 0 }),
  )
  window.localStorage.setItem("onboardingExperiment", "E1A1")
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
  await context.addInitScript(extensionInitScript)
  return context
}

const initBrowserWithExtension = async (
  userDataDir: string,
  buildDir: string,
) => {
  const browserContext = await createBrowserContext(userDataDir, buildDir)
  const page = await browserContext.newPage()

  await page.bringToFront()
  await page.goto("chrome://extensions", { waitUntil: "domcontentloaded" })
  await page.locator('[id="devMode"]').click()
  await page
    .locator('[id="extension-id"]')
    .waitFor({ state: "visible", timeout: 30000 })
  const extensionId = await page
    .locator('[id="extension-id"]')
    .first()
    .textContent()
    .then((text) => text?.replace("ID: ", "").replace(/[\n\s]/g, ""))

  const extensionURL = `chrome-extension://${extensionId}/index.html`
  await page.goto(extensionURL)
  await page.waitForLoadState("networkidle")

  // Close all other pages except the current extension page
  const pages = browserContext.pages()
  for (const p of pages) {
    if (p !== page) {
      await p.close()
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" })
  return { browserContext, extensionURL, page }
}

interface PerformanceMetrics {
  timeToFirstPaint: number
  timeToInteractive: number
  javaScriptHeapSize: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
}

const collectPerformanceMetrics = async (
  page: Page,
): Promise<PerformanceMetrics> => {
  return await page.evaluate(() => {
    const paintEntries = performance.getEntriesByType("paint")
    const memory = (performance as any).memory

    return {
      timeToFirstPaint:
        paintEntries.find((entry) => entry.name === "first-paint")?.startTime ||
        0,
      firstContentfulPaint: paintEntries.find(
        (entry) => entry.name === "first-contentful-paint",
      )?.startTime,
      timeToInteractive:
        performance.timing.domInteractive - performance.timing.navigationStart,
      javaScriptHeapSize: memory?.usedJSHeapSize || 0,
      largestContentfulPaint: (window as any).largestContentfulPaint,
    }
  })
}

let browserCtx: ChromiumBrowserContext

function createExtension({
  label,
  upgrade = false,
  measurePerformance = false,
}: {
  label: string
  upgrade?: boolean
  measurePerformance?: boolean
}) {
  return async ({}, use: any, testInfo: TestInfo) => {
    const userDataDir = `/tmp/test-user-data-${uuid()}`
    const buildDir = upgrade
      ? (await fs.copy(config.distDir, config.migVersionDir),
        config.migVersionDir)
      : config.distDir

    const { browserContext, page, extensionURL } =
      await initBrowserWithExtension(userDataDir, buildDir)
    browserCtx = browserContext

    process.env.workerIndex = testInfo.workerIndex.toString()
    const extension = new ExtensionPage(page, extensionURL, upgrade)

    await browserContext.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
      title: testInfo.title,
    })

    if (measurePerformance) {
      const metrics = await collectPerformanceMetrics(page)
      testInfo.attachments.push({
        name: `${label}-performance-metrics.json`,
        contentType: "application/json",
        body: Buffer.from(JSON.stringify(metrics, null, 2)),
      })
    }

    await use(extension)

    if (isKeepArtifacts(testInfo)) {
      await Promise.all([
        saveArtifact(testInfo, page, label, "html"),
        saveArtifact(testInfo, page, label, "screenshot"),
        browserContext.tracing.stop({
          path: getArtifactPath(testInfo, label, "trace.zip"),
        }),
      ])
      await browserContext.close()
      await saveArtifact(testInfo, page, label, "video")
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

function createDapp() {
  return async (
    { browserContext }: { browserContext: ChromiumBrowserContext },
    use: any,
  ): Promise<void> => {
    const page = await browserContext.newPage()
    const dappPage = new DappPage(page)

    await page.emulateMedia({ reducedMotion: "reduce" })
    await use(dappPage)
  }
}

const test = testBase.extend<TestExtensions>({
  extension: createExtension({ label: "extension" }),
  secondExtension: createExtension({ label: "secondExtension" }),
  thirdExtension: createExtension({ label: "thirdExtension" }),
  upgradeExtension: createExtension({
    label: "upgradeExtension",
    upgrade: true,
  }),
  extensionPerformance: createExtension({
    label: "performanceTest",
    upgrade: false,
    measurePerformance: true,
  }),
  browserContext: getContext(),
  dappPage: createDapp(),
})

export default test
