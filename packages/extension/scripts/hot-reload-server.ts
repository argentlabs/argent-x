import path from "path"

import chokidar from "chokidar"
import debounce from "lodash/debounce"
import WebSocket from "ws"

import { HOT_RELOAD_MESSAGE, HOT_RELOAD_PORT } from "../src/shared/utils/dev"

/** watch webpack output changes to trigger reload */
const watchChangesInPath = path.join(__dirname, "../dist")

const wss = new WebSocket.Server({ port: HOT_RELOAD_PORT })

wss.on("listening", () => {
  console.log(`Hot reload server listening on port ${HOT_RELOAD_PORT}`)
})

wss.on("close", () => {
  console.log("Hot reload server closed")
})

wss.on("connection", (ws) => {
  console.log(
    `Hot reload server connected, watching for changes in ${watchChangesInPath}`,
  )
  chokidar
    .watch(watchChangesInPath, {
      ignoreInitial: true,
    })
    .on(
      "all",
      debounce(() => {
        ws.send(HOT_RELOAD_MESSAGE)
      }, 500),
    )
})
