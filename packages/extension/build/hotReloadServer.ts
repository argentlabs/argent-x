import path from "path"

import chokidar from "chokidar"
import WebSocket from "ws"

import {
  HOT_RELOAD_UI_MESSAGE,
  HOT_RELOAD_PORT,
  HOT_RELOAD_BACKGROUND_MESSAGE,
} from "../src/shared/utils/dev"
import { debounce } from "./utils"

/** watch webpack output changes to trigger reload */
const watchChangesInPath = path.join(__dirname, "../dist")

/** files that trigger a background (and therefore also ui) reload */
const backgroundOnlyFiles = ["background.js"]
const backgroundOnlyFilesWithPath = backgroundOnlyFiles.map(
  (backgroundOnlyFile) => path.join(watchChangesInPath, backgroundOnlyFile),
)

export function startHotReloadServer() {
  const wss = new WebSocket.Server({ port: HOT_RELOAD_PORT })

  wss.on("listening", () => {
    console.log(`🛠️  Hot reload server listening on port ${HOT_RELOAD_PORT}`)
  })

  wss.on("close", () => {
    console.log("Hot reload server closed")
  })

  wss.on("connection", (ws) => {
    console.log(
      `👀 Hot reload server connected, watching for changes in ${watchChangesInPath}`,
    )

    /** ui - ignore background files */
    chokidar
      .watch(watchChangesInPath, {
        ignoreInitial: true,
        ignored: backgroundOnlyFilesWithPath,
      })
      .on(
        "all",
        debounce((eventName) => {
          if (["add", "change", "unlink"].includes(eventName)) {
            ws.send(HOT_RELOAD_UI_MESSAGE)
          }
        }, 500),
      )

    /** background */
    chokidar
      .watch(backgroundOnlyFilesWithPath, {
        ignoreInitial: true,
      })
      .on(
        "all",
        debounce((eventName) => {
          if (["add", "change", "unlink"].includes(eventName)) {
            ws.send(HOT_RELOAD_BACKGROUND_MESSAGE)
          }
        }, 500),
      )
  })
}
