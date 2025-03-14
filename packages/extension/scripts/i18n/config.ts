import path from "path"
import dotenv from "dotenv"

dotenv.config()

const srcDir = path.resolve(__dirname, "../../src")
const outputDir = path.resolve(srcDir, "assets/locales")

export const I18N_ENABLED = process.env.FEATURE_I18N === "true"

// Possible values for lng, these match expected values in Lokalise project
// ["en", "vi", "zh_CN", "tr", "uk", "ru"]

export const config = {
  inputDir: srcDir,
  outputDir: outputDir,
  lng: "en",
  defaultNS: "translation",
}

export const defaultTranslationFilePath = path.join(
  config.outputDir,
  config.lng,
  `${config.defaultNS}.json`,
)
