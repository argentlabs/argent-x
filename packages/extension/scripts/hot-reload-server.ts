import path from "path"

import chokidar from "chokidar"
import { debounce } from "lodash"
import WebSocket from "ws"

import { HOT_RELOAD_MESSAGE, HOT_RELOAD_PORT } from "../src/shared/utils/dev"

const srcUiPath = path.resolve("./src/ui")

const wss = new WebSocket.Server({ port: HOT_RELOAD_PORT })

wss.on("listening", () => {
  console.log(`Hot reload server listening on port ${HOT_RELOAD_PORT}`)
})

wss.on("close", () => {
  console.log("Hot reload server closed")
})

wss.on("connection", (ws) => {
  console.log(
    `Hot reload server connected, watching for changes in ${srcUiPath}`,
  )
  chokidar
    .watch(srcUiPath, {
      ignoreInitial: true,
    })
    .on(
      "all",
      debounce(() => {
        ws.send(HOT_RELOAD_MESSAGE)
      }, 500),
    )
})
