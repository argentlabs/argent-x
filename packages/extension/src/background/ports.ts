import browser from "webextension-polyfill"

let uiPort: browser.Runtime.Port | undefined
let contentPort: browser.Runtime.Port | undefined

export function getPort(port: "content" | "ui") {
  return port === "ui" ? uiPort : contentPort
}

browser.runtime.onConnect.addListener(async function (port) {
  if (!port.name.startsWith("argent-x")) {
    console.warn("Not allowed", port.name)
    return
  }
  if (port.name === "argent-x-content") {
    contentPort = port
    if (uiPort) {
      port.onMessage.addListener((data) => {
        getPort("ui")?.postMessage(data)
      })
    }
  } else if (port.name === "argent-x-ui") {
    uiPort = port
    if (contentPort) {
      port.onMessage.addListener((data) => {
        getPort("content")?.postMessage(data)
      })
    }
  }
})
