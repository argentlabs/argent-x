import axios from "axios"
import * as fs from "fs"
import * as path from "path"
import { pipeline } from "stream"
import { promisify } from "util"
import config from "../config"

const streamPipeline = promisify(pipeline)

export async function downloadGitHubRelease(version: string): Promise<void> {
  const owner = config.migRepoOwner
  const repo = config.migRepo
  const tag = `@argent-x/extension@${version}`
  const assetName = config.migReleaseName
  const token = config.migRepoToken
  const outputPath = `${config.migDir}${version}.zip`
  try {
    // Get release by tag name
    const releaseResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Node.js",
        },
      },
    )

    const releaseData = releaseResponse.data

    // Find the asset by name
    const asset = releaseData.assets.find((a: any) => a.name === assetName)

    if (!asset) {
      throw new Error(`Asset ${assetName} not found in release ${tag}`)
    }

    const assetUrl = asset.url

    // Download the asset
    const assetResponse = await axios.get(assetUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/octet-stream",
        "User-Agent": "Node.js",
      },
      responseType: "stream", // Important for streaming the response
    })

    // Ensure the output directory exists
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Write the file
    await streamPipeline(assetResponse.data, fs.createWriteStream(outputPath))

    console.log(`Asset downloaded to ${outputPath}`)
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
  }
}
