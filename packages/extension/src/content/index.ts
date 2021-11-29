import browser from "webextension-polyfill"

import { messageStream, sendMessage } from "../shared/messages"
import { WindowMessageType } from "../shared/MessageType"

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
    if (!event.data?.forwarded && event.data?.extensionId === argentExtensionId)
      sendMessage({ ...event.data })
  },
)
messageStream.subscribe(([msg]) => {
  window.postMessage(
    { ...msg, forwarded: true, extensionId: argentExtensionId },
    window.location.origin,
  )
})
