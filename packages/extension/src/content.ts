import { Relayer, WindowMessenger } from "@argent/x-window"
import { relay } from "trpc-browser/relay"
import browser from "webextension-polyfill"

import { ExtensionMessenger } from "./shared/extensionMessenger"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

const windowMessenger = new WindowMessenger(window, {
  post: window.location.origin,
})
const port = browser.runtime.connect()
const portMessenger = new ExtensionMessenger(port)

const bridge = new Relayer(windowMessenger, portMessenger)

// Please keep this log statement, it is used to detect if the bridge is loaded
console.log("Legacy Bridge ID:", bridge.id)

// NOTE: not used yet, as trpc is only used for UI <-> Background comms atm
const unsub = relay(window, port)
// unsub on content script unload
window.addEventListener("unload", unsub)
