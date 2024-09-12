import dotenv from "dotenv"
import fs from "fs"
import path from "path"

function getDotEnv() {
  const dotEnvPath = path.resolve(__dirname, "..", ".env")
  if (!fs.existsSync(dotEnvPath)) {
    return {}
  }
  const dotEnvRaw = fs.readFileSync(dotEnvPath, "utf8")
  const config = dotenv.parse(dotEnvRaw)
  return config
}

export const dotEnvConfig = getDotEnv()
