import browser from "webextension-polyfill"

import { messageStream, sendMessage } from "../shared/messages"
import { MessageType } from "../shared/MessageType"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

window.addEventListener("message", function (event: MessageEvent<MessageType>) {
  if (!("forwarded" in event.data)) sendMessage({ ...event.data }) // circut breaker
})
messageStream.subscribe(([msg]) => {
  window.postMessage({ ...msg, forwarded: true }, window.location.origin)
})
