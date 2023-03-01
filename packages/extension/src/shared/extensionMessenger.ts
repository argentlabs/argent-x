import { Listener, Message, Messenger } from "@argent/x-window"
import browser from "webextension-polyfill"

export class ExtensionMessenger implements Messenger {
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
