import { Message, Messenger, ResponseMessage } from "../messenger"

type AllowPromise<T> = T | Promise<T>
type InferPromise<T> = T extends Promise<infer U> ? U : T
type WrapPromise<T> = T extends Promise<infer U> ? Promise<U> : Promise<T>

export interface Methods {
  [key: string]: (...args: any) => AllowPromise<any>
}

export type MethodsToImplementations<T extends Methods> = {
  [K in keyof T]: (
    origin: string,
  ) => (...args: Parameters<T[K]>) => WrapPromise<ReturnType<T[K]>>
}

export class Sender<RemoteMethods extends Methods> {
  public readonly id = Math.random().toString(36).slice(2)
  private readonly pendingRequests: Map<
    string,
    (response: ResponseMessage) => void
  > = new Map()

  constructor(
    private readonly postMessenger: Messenger,
    private readonly listenMessenger: Messenger = postMessenger,
  ) {
    this.listenMessenger.addListener(this.handleMessage)
  }

  public call = <
    K extends keyof RemoteMethods,
    Args extends Parameters<RemoteMethods[K]>,
    Result extends InferPromise<ReturnType<RemoteMethods[K]>>,
  >(
    method: K,
    ...args: Args
  ): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).slice(2)

      // timeout (log only)
      const timeoutPid = setTimeout(() => {
        console.warn(
          new Error(
            `Request #${id} takes long (>10s): ${method.toString()}(${args})`,
          ),
        )
      }, 10000) // 10 seconds

      this.pendingRequests.set(id, (result) => {
        clearTimeout(timeoutPid)
        if ("result" in result) {
          resolve(result.result as any)
        } else if ("error" in result) {
          reject(new Error((result.error as any).message))
        } else {
          reject(new Error("Invalid response"))
        }
      })

      this.postMessenger.postMessage({
        id,
        type: "REQUEST",
        method: method.toString(),
        args,
        meta: {
          sender: this.id,
        },
      })
    })
  }

  private handleMessage = (message: Message, _: string) => {
    const { type, id } = message
    if (type === "RESPONSE") {
      const request = this.pendingRequests.get(id)
      if (request) {
        request(message)
        this.pendingRequests.delete(id)
      }
    }
  }
}

export class Receiver<LocalMethods extends Methods> {
  public readonly id = Math.random().toString(36).slice(2)

  constructor(
    private readonly listenMessenger: Messenger,
    private readonly localMethods: MethodsToImplementations<LocalMethods>,
    private readonly postMessenger: Messenger = listenMessenger,
  ) {
    this.listenMessenger.addListener(this.handleMessage)
  }

  public destroy = () => {
    this.listenMessenger.removeListener(this.handleMessage)
  }

  private handleMessage = (message: Message, origin: string) => {
    if (message.meta?.sender === this.id) {
      return
    }
    if (message.type === "REQUEST") {
      const method = this.localMethods[message.method]
      if (method) {
        method(origin)(...(message.args as any)).then(
          (result) =>
            this.postMessenger.postMessage({
              id: message.id,
              type: "RESPONSE",
              result: result ?? null,
              meta: {
                sender: this.id,
              },
            }),
          (error) =>
            this.postMessenger.postMessage({
              id: message.id,
              type: "RESPONSE",
              error,
              meta: {
                sender: this.id,
              },
            }),
        )
      } else {
        this.postMessenger.postMessage({
          id: message.id,
          type: "RESPONSE",
          error: new Error(`Method ${message.method} not found`),
          meta: {
            sender: this.id,
          },
        })
      }
    }
  }
}
