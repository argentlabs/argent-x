import { startHotReloadServer } from "./hotReloadServer"
import { launchReactDevTools } from "./reactDevTools"

export function startDevTools() {
  console.log("🧰 Starting dev tools")
  startHotReloadServer()
  launchReactDevTools()
}

startDevTools()
