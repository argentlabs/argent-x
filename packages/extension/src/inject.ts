import browser from "webextension-polyfill"
import { Messenger } from "./utils/Messenger"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

const port = browser.runtime.connect({ name: "argent-x" })
const messenger = new Messenger(
  (emit) => {
    window.addEventListener("message", function (event) {
      port.postMessage(event.data)
      if (event.data.from && event.data.type && event.data.from == "INPAGE") {
        const { type, data } = event.data
        emit(type, data)
      }
    })
    port.onMessage.addListener(function (msg) {
      window.postMessage(msg, "*")
      if (msg.from && msg.type && msg.from == "BACKGROUND") {
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

messenger.listen((type, data) => {
  console.log("INJECT", type, data)
})

setTimeout(() => {
  messenger.emit("HELLO", "from inject")
}, 2000)
