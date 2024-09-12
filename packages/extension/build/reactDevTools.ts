import { exec, execSync } from "child_process"
import os from "os"

import { useReactDevTools } from "./config"

function checkReactDevTools() {
  const command = os.platform() === "win32" ? "where" : "which"

  try {
    execSync(`${command} react-devtools`, { stdio: "ignore" })
    return true
  } catch (error) {
    console.error(
      "❌ react-devtools is not installed - run `npm install -g react-devtools`",
    )
    return false
  }
}

export function launchReactDevTools() {
  if (useReactDevTools) {
    console.log("🛠️  Launching react-devtools")
    if (!checkReactDevTools()) {
      return
    }
    exec("react-devtools")
  }
}
