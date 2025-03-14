import * as fs from "fs"
import config from "../config"

export default async function tearDown() {
  const start = performance.now()
  try {
    const files = fs
      .readdirSync(config.artifactsDir)
      .filter((f) => f.endsWith("webm"))

    if (files.length > 0) {
      console.log(`Cleaning up ${files.length} video files...`)
      for (const file of files) {
        fs.rmSync(`${config.artifactsDir}/${file}`)
      }
    }
  } catch (error) {
    console.error(
      "Teardown failed:",
      error instanceof Error ? error.message : error,
    )
  } finally {
    const duration = performance.now() - start
    console.log(`Teardown completed in ${duration.toFixed(2)}ms`)
  }
}
