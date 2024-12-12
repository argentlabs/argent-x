import * as fs from "fs"
import config from "../config"

export default async function tearDown() {
  console.time("tearDown")
  try {
    fs.readdirSync(config.artifactsDir)
      .filter((f) => f.endsWith("webm"))
      .forEach((fileToDelete) => {
        fs.rmSync(`${config.artifactsDir}/${fileToDelete}`)
      })
  } catch (error) {
    console.error({ op: "tearDown", error })
  }
  console.timeEnd("tearDown")
}
