import { Messenger } from "./utils/Messenger"

const extId = document
  .getElementById("argent-x-extension")
  ?.getAttribute("data-extension-id")

console.log("Hello from extensionId:", extId)

var data = { type: "FROM_PAGE", text: "Hello from the webpage!" }
window.postMessage(data, "*")

window.addEventListener("message", function (event) {
  if (event.data.type && event.data.type == "FROM_EXT") {
    console.log("Ext: " + event.data.text)
    debugger
  }
})

const messenger = new Messenger(
  (emit) => {
    window.addEventListener("message", function (event) {
      if (event.data.from && event.data.type && event.data.from == "INJECT") {
        const { type, data } = event.data
        emit(type, data)
      }
    })
  },
  (type, data) => {
    window.postMessage({ from: "INPAGE", type, data }, "*")
  },
)

messenger.listen((type, data) => {
  console.log("INPAGE", type, data)
})
;(window as any).openUi = () => {
  messenger.emit("OPEN_UI", null)
}
