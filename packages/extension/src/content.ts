import {
  Listener,
  Message,
  Messenger,
  Relayer,
  WindowMessenger,
} from "@argent/x-window"
import browser from "webextension-polyfill"

// import { WindowMessageType } from "./shared/messages"
// import { messageStream, sendMessage } from "./shared/messages"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const argentExtensionId = browser.runtime.id
script.id = "argent-x-extension"
script.setAttribute("data-extension-id", argentExtensionId)

container.insertBefore(script, container.children[0])

class ExtensionMessenger implements Messenger {
  private listeners = new Map<
    Listener,
    (message: unknown, port: browser.runtime.Port) => void
  >()

  constructor(private readonly port: browser.runtime.Port) {}

  public addListener = (listener: Listener) => {
    const listenerWrapper = (message: any, sender: browser.runtime.Port) => {
      listener(message, sender.sender?.origin ?? "unknown")
    }
    this.listeners.set(listener, listenerWrapper)
    this.port.onMessage.addListener(listenerWrapper)
  }

  public removeListener = (listener: Listener) => {
    const listenerWrapper = this.listeners.get(listener)
    if (listenerWrapper) {
      this.port.onMessage.removeListener(listenerWrapper)
    }
  }

  public postMessage = (message: Message) => {
    if (this.port) {
      this.port.postMessage(message)
    }
  }
}

const windowMessenger = new WindowMessenger(window, {
  post: window.location.origin,
})
const port = browser.runtime.connect()
const portMessenger = new ExtensionMessenger(port)

const bridge = new Relayer(windowMessenger, portMessenger)

console.log("Bridge ID:", bridge.id)
