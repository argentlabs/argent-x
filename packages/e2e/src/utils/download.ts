import axios from "axios"
import fs from "fs"
import { Stream, Readable } from "stream"
import { promisify } from "util"
import config from "../config"

const pipeline = promisify(Stream.pipeline)

function getFileIdByVersion(version: string) {
  const versionData = JSON.parse(config.migVersions!)
  const item = versionData.find(
    (item: { version: string; fileId: string }) => item.version === version,
  )
  return item ? item.fileId : null
}

export async function downloadFile(version: string): Promise<void> {
  const fileId = getFileIdByVersion(version)
  console.log("Downloading file:", fileId)
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  const destPath = `${config.migDir}${version}.zip`
  try {
    const response = await axios<Stream>({
      method: "GET",
      url: driveUrl,
      responseType: "stream",
    })

    if (response.status !== 200) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`,
      )
    }

    const writer = fs.createWriteStream(destPath)

    if (!(response.data instanceof Readable)) {
      throw new Error("Response data is not a readable stream")
    }

    await pipeline(response.data, writer)

    console.log("File downloaded successfully")
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error downloading file:", error.message)
    } else {
      console.error("An unknown error occurred")
    }
    throw error
  }
}
