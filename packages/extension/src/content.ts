import browser from "webextension-polyfill"

import { WindowMessageType } from "./shared/messages"
import { messageStream, sendMessage } from "./shared/messages"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

window.addEventListener(
  "message",
  function (event: MessageEvent<WindowMessageType>) {
    // forward messages which were not forwarded before and belong to the extension
    if (
      !event.data?.forwarded &&
      event.data?.extensionId === argentExtensionId &&
      event.origin === window.location.origin
    ) {
      console.log("forwarding message", event.data, event)
      sendMessage({ ...event.data })
    }
  },
)
messageStream.subscribe(([msg]) => {
  window.postMessage(
    { ...msg, forwarded: true, extensionId: argentExtensionId },
    window.location.origin,
  )
})
