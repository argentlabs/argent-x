import dotenv from "dotenv"
dotenv.config()

import * as fs from "fs"
import path from "path"

import { Page, TestInfo } from "@playwright/test"
export const artifactsDir = path.resolve(
  __dirname,
  "../../artifacts/playwright",
)
export const reportsDir = path.resolve(__dirname, "../../artifacts/reports")
export const isCI = Boolean(process.env.CI)
export const outputFolder = (testInfo: TestInfo) =>
  testInfo.title.replace(/\s+/g, "_").replace(/\W/g, "")
export const artifactFilename = (testInfo: TestInfo, label: string) =>
  `${testInfo.retry}-${testInfo.status}-${label}-${testInfo.workerIndex}`
export const isKeepArtifacts = (testInfo: TestInfo) =>
  testInfo.config.preserveOutput === "always" ||
  (testInfo.config.preserveOutput === "failures-only" &&
    testInfo.status === "failed") ||
  testInfo.status === "timedOut"

export const artifactSetup = async (testInfo: TestInfo, label: string) => {
  await fs.promises
    .mkdir(path.resolve(artifactsDir, outputFolder(testInfo)), {
      recursive: true,
    })
    .catch((error) => {
      console.error({ op: "artifactSetup", error })
    })
  return artifactFilename(testInfo, label)
}

export const saveHtml = async (
  testInfo: TestInfo,
  page: Page,
  label: string,
) => {
  console.log({
    op: "saveHtml",
    label,
  })
  const fileName = await artifactSetup(testInfo, label)
  const htmlContent = await page.content()
  await fs.promises
    .writeFile(
      path.resolve(artifactsDir, outputFolder(testInfo), `${fileName}.html`),
      htmlContent,
    )
    .catch((error) => {
      console.error({ op: "saveHtml", error })
    })
}

export const keepVideos = async (
  testInfo: TestInfo,
  page: Page,
  label: string,
) => {
  console.log({
    op: "keepVideos",
    label,
  })
  const fileName = await artifactSetup(testInfo, label)
  await page
    .video()
    ?.saveAs(
      path.resolve(artifactsDir, outputFolder(testInfo), `${fileName}.webm`),
    )
    .catch((error) => {
      console.error({ op: "keepVideos", error })
    })
}
