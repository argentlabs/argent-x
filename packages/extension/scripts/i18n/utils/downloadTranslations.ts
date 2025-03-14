import fs from "fs-extra"
import path from "path"
import { unzipSync } from "fflate"

import { config } from "../config"
import { getLokaliseApi, LOKALISE_PROJECT_ID } from "./lokaliseApi"
import { prettifyAndWriteFile } from "../../utils/prettifyAndWriteFile"

/**
 * This script downloads the translations from the server and saves them to the assets/locales folder
 */

export async function downloadTranslations() {
  if (!LOKALISE_PROJECT_ID) {
    throw new Error("LOKALISE_PROJECT_ID is required")
  }

  const downloadResponse = await getLokaliseApi()
    .files()
    .download(LOKALISE_PROJECT_ID, {
      format: "json",
      original_filenames: true,
      placeholder_format: "i18n",
    })

  const translationsUrl = downloadResponse.bundle_url

  // Download the zip file
  const response = await fetch(translationsUrl)
  const arrayBuffer = await response.arrayBuffer()

  // Unzip the contents
  const uint8Array = new Uint8Array(arrayBuffer)
  const unzipped = unzipSync(uint8Array)

  // Process and save each file from the zip
  for (const [filename, contents] of Object.entries(unzipped)) {
    if (!filename.endsWith(".json")) {
      continue
    }
    const targetPath = path.join(config.outputDir, filename)

    await fs.ensureDir(path.dirname(targetPath))

    const textContents = new TextDecoder().decode(contents)
    await prettifyAndWriteFile(targetPath, textContents)
  }
}
