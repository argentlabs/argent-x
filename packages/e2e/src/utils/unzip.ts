import { exec } from "child_process"
import * as path from "path"
import { promisify } from "util"
import config from "../config"

const execAsync = promisify(exec)

export const unzip = async (version: string): Promise<string> => {
  const zipFilePath = path.join(config.migDir, `${version}.zip`)
  const outputDir = path.join(config.migDir, version)
  const scriptPath = path.join(__dirname, "unzip.sh")

  try {
    console.log(`###### Unzipping ${version}.zip`)

    // Ensure the script is executable
    await execAsync(`chmod +x ${scriptPath}`)

    // Execute the unzip script
    const { stdout, stderr } = await execAsync(
      `bash "${scriptPath}" "${zipFilePath}" "${outputDir}"`,
      { maxBuffer: 1024 * 1024 * 10 }, // Increase buffer size to 10MB
    )

    console.log(`Unzip Output:\n${stdout}`)

    if (stderr) {
      console.warn(`Unzip Warnings:\n${stderr}`)
    }
  } catch (error) {
    console.error(`Error during unzip: ${error}`)
    throw error
  }

  return `${outputDir}`
}
