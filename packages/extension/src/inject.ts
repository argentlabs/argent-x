import browser from "webextension-polyfill"

import { MessageType } from "./utils/MessageType"
import { Messenger } from "./utils/Messenger"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

const allowedSender = ["INPAGE", "UI", "BACKGROUND"]
const port = browser.runtime.connect({ name: "argent-x-content" })
const messenger = new Messenger<MessageType>(
  (emit) => {
    window.addEventListener("message", function (event) {
      port.postMessage(event.data)
      if (
        event.data.from &&
        event.data.type &&
        allowedSender.includes(event.data.from)
      ) {
        const { type, data } = event.data
        emit(type, data)
      }
    })
    port.onMessage.addListener(function (msg) {
      window.postMessage(msg, "*")
      if (msg.from && msg.type && allowedSender.includes(msg.from)) {
        const { type, data } = msg
        emit(type, data)
      }
    })
  },
  (type, data) => {
    window.postMessage({ from: "INJECT", type, data }, "*")
    port.postMessage({ from: "INJECT", type, data })
  },
)
