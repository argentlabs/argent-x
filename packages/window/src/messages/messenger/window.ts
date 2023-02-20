import { Listener, Message, Messenger } from "."

export class WindowMessenger implements Messenger {
  private readonly listeners: Set<Listener>
  private readonly origins: {
    post: string
    listen: string
  }

  constructor(
    private readonly window: Pick<
      Window,
      "postMessage" | "addEventListener" | "removeEventListener"
    >,
    {
      post = "*",
      listen = "*",
    }: {
      post?: string
      listen?: string
    } = {},
  ) {
    this.listeners = new Set()
    this.origins = {
      post,
      listen,
    }
  }

  public addListener = (listener: Listener) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      this.window.addEventListener("message", this.handleMessage)
    }
  }

  public removeListener = (listener: Listener) => {
    this.listeners.delete(listener)
    if (this.listeners.size === 0) {
      this.window.removeEventListener("message", this.handleMessage)
    }
  }

  public postMessage = (message: Message) => {
    this.window.postMessage(message, this.origins.post)
  }

  private handleMessage = (event: MessageEvent) => {
    this.listeners.forEach((listener) => {
      if (event.origin === this.origins.listen || this.origins.listen === "*") {
        listener(event.data, event.origin) // origin need to be from a trusted source
      }
    })
  }
}
