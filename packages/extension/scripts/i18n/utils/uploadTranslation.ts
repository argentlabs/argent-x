import fs from "fs-extra"
import path from "path"

import { config, defaultTranslationFilePath } from "../config"
import { getLokaliseApi, LOKALISE_PROJECT_ID } from "./lokaliseApi"

/**
 * This script uploads the default en translation file to the server
 */

export async function uploadTranslation() {
  if (!LOKALISE_PROJECT_ID) {
    throw new Error("LOKALISE_PROJECT_ID is required")
  }

  console.log("🚀 Uploading translation file to Lokalise…")

  console.log("defaultTranslationFilePath", defaultTranslationFilePath)

  const translation = await fs.readFile(defaultTranslationFilePath, "utf-8")

  const translationJson = JSON.parse(translation)
  const tranlsationFlat: Record<string, string> = {}
  for (const [rootKey, rootValue] of Object.entries(translationJson)) {
    for (const [key, value] of Object.entries(
      rootValue as Record<string, string>,
    )) {
      tranlsationFlat[`${rootKey}.${key}`] = value
    }
  }

  const filename = path.basename(defaultTranslationFilePath)
  const lang_iso = config.lng

  const data_base64 = Buffer.from(translation).toString("base64")

  const uploadProcess = await getLokaliseApi()
    .files()
    .upload(LOKALISE_PROJECT_ID, {
      data: data_base64,
      filename,
      lang_iso,
    })

  console.log("🚀 Translation upload process status:", uploadProcess.status)
}
