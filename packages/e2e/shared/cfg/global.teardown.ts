import { artifactsDir } from "./test"
import * as fs from "fs"

export default function cleanArtifactDir() {
  console.time("cleanArtifactDir")
  try {
    fs.readdirSync(artifactsDir)
      .filter((f) => f.endsWith("webm"))
      .forEach((fileToDelete) => {
        fs.rmSync(`${artifactsDir}/${fileToDelete}`)
      })
  } catch (error) {
    console.error({ op: "cleanArtifactDir", error })
  }
  console.timeEnd("cleanArtifactDir")
}
