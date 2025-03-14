import fs from "fs-extra"
import path from "path"
import { camelCase, cloneDeep } from "lodash-es"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { processFile } from "./utils/processFile"
import { config, defaultTranslationFilePath, I18N_ENABLED } from "./config"
import { uploadTranslation } from "./utils/uploadTranslation"
import { prettifyAndWriteFile } from "../utils/prettifyAndWriteFile"

/**
 * This script extracts translation from .tsx source code and saves them to a JSON file.
 * It is used to generate or update the en/translation.json file
 */

interface Arguments {
  files?: string[]
  upload: boolean
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("files", {
    type: "array",
    description: "One or more paths to files to process",
  })
  .option("upload", {
    type: "boolean",
    description: "Whether to upload the translations",
    default: false,
  })
  .help()
  .parseSync() as Arguments

// Merge new translation with existing ones
export function mergeTranslation(
  existing: Record<string, Record<string, string>>,
  newTranslation: Record<string, string>,
): Record<string, Record<string, string>> {
  const merged = cloneDeep(existing)

  Object.entries(newTranslation).forEach(([key, value]) => {
    const [screenName, ...rest] = key.split(".")

    if (!rest.length) {
      return
    }

    const camelScreenName = camelCase(screenName)
    if (!merged[camelScreenName]) {
      merged[camelScreenName] = {}
    }

    merged[camelScreenName][camelCase(rest.join(" "))] = value
  })

  return merged
}

// Create or update translation object and file
function createOrUpdateTranslationFile(
  translation: Record<string, string>,
): boolean {
  if (!fs.existsSync(path.dirname(defaultTranslationFilePath))) {
    fs.mkdirSync(path.dirname(defaultTranslationFilePath), { recursive: true })
  }

  let existingTranslation: Record<string, Record<string, string>> = {}

  // Read existing translation if they exist
  if (fs.existsSync(defaultTranslationFilePath)) {
    try {
      const existingContent = fs.readFileSync(
        defaultTranslationFilePath,
        "utf-8",
      )
      existingTranslation = JSON.parse(existingContent)
      console.log(
        `📖 Found existing translation in ${defaultTranslationFilePath}`,
      )
    } catch (error) {
      console.warn(
        `⚠️  Error reading existing translation: ${error}. Starting fresh.`,
      )
    }
  }

  // Merge new translation with existing ones
  const mergedTranslation = mergeTranslation(existingTranslation, translation)

  // Check if the merged translation is different from the existing one
  const wasModified =
    JSON.stringify(mergedTranslation) !== JSON.stringify(existingTranslation)

  if (!wasModified) {
    return false
  }

  // Write translation to file
  fs.writeFileSync(
    defaultTranslationFilePath,
    JSON.stringify(mergedTranslation, null, 2),
  )
  return true
}

// Process a single file and return its translation
async function processSingleFile(
  filePath: string,
  allTranslation: Record<string, string>,
): Promise<void> {
  if (!filePath.endsWith(".tsx") || filePath.endsWith(".test.tsx")) {
    return
  }

  const { code, translation, needsTranslation } = await processFile(filePath)

  // Only write back to file if we found translation
  if (needsTranslation) {
    Object.assign(allTranslation, translation)
    await prettifyAndWriteFile(filePath, code)
  }
}

// Process all files in a directory
async function processDirectory(dir: string): Promise<Record<string, string>> {
  const allTranslation: Record<string, string> = {}

  async function processDir(currentDir: string): Promise<void> {
    const files = fs.readdirSync(currentDir)

    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        await processDir(filePath)
      } else {
        await processSingleFile(filePath, allTranslation)
      }
    }
  }

  await processDir(dir)
  return allTranslation
}

// Process an array of files
async function processFiles(
  filePaths: string[],
): Promise<Record<string, string>> {
  const allTranslation: Record<string, string> = {}

  for (const filePath of filePaths) {
    await processSingleFile(filePath, allTranslation)
  }

  return allTranslation
}

// Main execution
async function extractTranslation(): Promise<void> {
  console.log("🔄 Extracting translations…")

  const filePaths = argv.files
  const shouldUpload = argv.upload

  const translation = filePaths?.length
    ? await processFiles(filePaths)
    : await processDirectory(config.inputDir)

  const wasModified = createOrUpdateTranslationFile(translation)

  console.log("✅ Translation extraction complete")

  if (wasModified) {
    console.log(`📁 Translation saved to: ${defaultTranslationFilePath}`)
    console.log(`🖋️  Extracted ${Object.keys(translation).length} new keys`)

    if (shouldUpload) {
      await uploadTranslation()
    }
  } else {
    console.log("🖋️  No new keys found - translation file not modified")
  }
}

if (I18N_ENABLED) {
  extractTranslation().catch(console.error)
}
