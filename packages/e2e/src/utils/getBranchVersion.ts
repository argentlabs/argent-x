import { execSync } from "child_process"
import * as path from "path"
import * as fs from "fs"

export const getBranchVersion = (): string => {
  const scriptPath = path.join(__dirname, "getBranchVersion.sh")

  try {
    // Make the script executable
    fs.chmodSync(scriptPath, "755")

    // Execute the script synchronously
    const stdout = execSync(`bash ${scriptPath}`, { encoding: "utf8" })

    console.log(`Version:${stdout}`)

    return stdout.trim()
  } catch (error) {
    console.error(`getVersion Error: ${error}`)
    throw error
  }
}
