import type { Listener, Message, Messenger } from "."

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
    let parsedMessage = { ...message }
    // cause data clone exception
    if ("error" in message) {
      parsedMessage = JSON.parse(
        JSON.stringify(message, function jsonFriendlyErrorReplacer(_, value) {
          if (value instanceof Error) {
            return {
              // Pull all enumerable properties, supporting properties on custom Errors
              ...value,
              // Explicitly pull Error's non-enumerable properties
              name: value.name,
              message: value.message,
              stack: value.stack,
            }
          }

          return value
        }),
      )
    }

    this.window.postMessage(parsedMessage, this.origins.post)
  }

  private handleMessage = (event: MessageEvent) => {
    this.listeners.forEach((listener) => {
      if (event.origin === this.origins.listen || this.origins.listen === "*") {
        listener(event.data, event.origin) // origin need to be from a trusted source
      }
    })
  }
}
