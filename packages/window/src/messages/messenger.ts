type AllowPromise<T> = T | Promise<T>
type InferPromise<T> = T extends Promise<infer U> ? U : T

type Listener = (message: unknown, origin: string) => AllowPromise<unknown>

export interface Messenger {
  postOrigin: string

  addListener: (listener: Listener) => void
  removeListener: (listener: Listener) => void
  postMessage: (message: unknown) => void
}

export class WindowMessenger implements Messenger {
  private readonly listeners: Set<Listener>

  public readonly postOrigin: string

  constructor(
    private readonly options: {
      postWindow: Window
      postOrigin: string
      listenWindow: Window
    },
  ) {
    this.listeners = new Set()

    this.postOrigin = options.postOrigin
  }

  public addListener = (listener: Listener) => {
    this.listeners.add(listener)
    if (this.listeners.size > 0) {
      this.options.listenWindow.addEventListener("message", this.handleMessage)
    }
  }

  public removeListener = (listener: Listener) => {
    this.listeners.delete(listener)
    if (this.listeners.size === 0) {
      this.options.listenWindow.removeEventListener(
        "message",
        this.handleMessage,
      )
    }
  }

  public postMessage = (message: unknown) => {
    this.options.postWindow.postMessage(message, this.options.postOrigin)
  }

  private handleMessage = (event: MessageEvent) => {
    this.listeners.forEach((listener) => {
      listener(event.data, event.origin)
    })
  }
}

// interface which allows for methods only
interface MethodImplementations {
  [key: string]: (args: any, origin: string) => AllowPromise<any>
}
interface RemoteMethods {
  [key: string]: (...args: any) => AllowPromise<any>
}

export type MethodsToImplementations<T extends RemoteMethods> = {
  [K in keyof T]: (args: Parameters<T[K]>, origin: string) => AllowPromise<any>
}

type InternalMessage =
  | {
      type: "request"
      id: string
      method: string
      args: unknown[]
    }
  | {
      type: "response"
      id: string
      result: unknown
    }
  | {
      type: "response"
      id: string
      error: unknown
    }

export class MessageExchange<
  TRemoteMethods extends RemoteMethods,
  TImplementedMethods extends MethodImplementations = Record<string, never>,
> {
  private readonly methods: TImplementedMethods

  private readonly messenger: Messenger

  constructor(messenger: Messenger, methods: TImplementedMethods) {
    this.methods = methods

    this.messenger = messenger

    this.messenger.addListener(this.handleMessage)
  }

  public destroy = () => {
    this.messenger.removeListener(this.handleMessage)
  }

  public call = async <K extends keyof TRemoteMethods>(
    method: K,
    ...args: Parameters<TRemoteMethods[K]> extends undefined
      ? []
      : Parameters<TRemoteMethods[K]>
  ): Promise<InferPromise<ReturnType<TRemoteMethods[K]>>> => {
    const id = Math.random().toString(36).slice(2)

    return new Promise<InferPromise<ReturnType<TRemoteMethods[K]>>>(
      (resolve, reject) => {
        const listener = (message: unknown) => {
          if (typeof message !== "object" || message === null) {
            return
          }

          const msg = message as InternalMessage

          const { type, id: responseId } = msg

          if (
            typeof responseId !== "string" ||
            typeof type !== "string" ||
            responseId !== id ||
            type !== "response"
          ) {
            return
          }

          this.messenger.removeListener(listener)

          if ("result" in msg) {
            resolve(msg.result as InferPromise<ReturnType<TRemoteMethods[K]>>)
          } else {
            reject(msg.error)
          }
        }

        this.messenger.addListener(listener)

        this.messenger.postMessage({
          type: "request",
          id,
          method,
          args,
        })
      },
    )
  }

  private handleMessage = async (message: unknown, origin: string) => {
    if (typeof message !== "object" || message === null) {
      return
    }

    const msg = message as InternalMessage

    const { type, id } = msg

    if (typeof id !== "string" || typeof type !== "string") {
      return
    }

    if (type === "request") {
      const { method, args } = msg

      if (typeof method !== "string" || this.methods[method] === undefined) {
        return
      }

      try {
        const result = await this.methods[method](args, origin)

        this.messenger.postMessage({
          type: "response",
          id,
          result,
        })
      } catch (error) {
        this.messenger.postMessage({
          type: "response",
          id,
          error,
        })
      }
    }
  }
}
