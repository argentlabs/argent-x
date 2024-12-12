import fs from "fs"
import path from "path"
import glob from "glob"

/** max allowed file size for Firefox is 4MB */
const MAX_SIZE_MB = 4
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const SOURCE_DIR = path.resolve(__dirname, "../dist")
const GLOB_PATTERN = `**/*.!(*(*.)map)`

function checkFileSizes() {
  const files = glob.sync(path.join(SOURCE_DIR, GLOB_PATTERN)).sort()
  let exceeded = false

  files.forEach((file) => {
    const stats = fs.statSync(file)
    const sizeInBytes = stats.size
    const formattedSize = formatSize(sizeInBytes)
    const relativePath = path.relative(SOURCE_DIR, file)

    if (sizeInBytes > MAX_SIZE_BYTES) {
      console.log(`\x1b[31mFAIL\x1b[0m ${relativePath} (${formattedSize})`)
      exceeded = true
    } else {
      console.log(`\x1b[32mPASS\x1b[0m ${relativePath} (${formattedSize})`)
    }
  })

  console.log("")

  if (exceeded) {
    console.log(
      `\x1b[31mFAIL\x1b[0m Some files exceed the ${MAX_SIZE_MB}MB size limit:`,
    )
    files.forEach((file) => {
      const stats = fs.statSync(file)
      const sizeInBytes = stats.size
      const formattedSize = formatSize(sizeInBytes)
      if (sizeInBytes > MAX_SIZE_BYTES) {
        const relativePath = path.relative(SOURCE_DIR, file)
        console.log(`     ${relativePath} (${formattedSize})`)
      }
    })
    process.exit(1)
  } else {
    console.log(`\x1b[32mPASS\x1b[0m All files are ${MAX_SIZE_MB}MB or smaller`)
    process.exit(0)
  }
}

function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

checkFileSizes()
