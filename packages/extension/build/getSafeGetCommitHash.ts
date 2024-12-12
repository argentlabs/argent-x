import { execSync } from "child_process"

import { dotEnvConfig } from "./dotEnv"

export function getSafeGetCommitHash() {
  if ("COMMIT_HASH_OVERRIDE" in dotEnvConfig) {
    return dotEnvConfig.COMMIT_HASH_OVERRIDE
  }
  try {
    const hash = execSync("git rev-parse HEAD")
    return hash.toString().trim()
  } catch {
    return "unknown"
  }
}
