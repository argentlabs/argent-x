import { Message, Messenger, ResponseMessage } from "../messenger"

type AllowPromise<T> = T | Promise<T>
type InferPromise<T> = T extends Promise<infer U> ? U : T

export interface Methods {
  [key: string]: (...args: any) => AllowPromise<any>
}

export type MethodsToImplementations<T extends Methods> = {
  [K in keyof T]: (
    origin: string,
  ) => (...args: Parameters<T[K]>) => ReturnType<T[K]>
}

export class BidirectionalExchange<
  RemoteMethods extends Methods,
  LocalMethods extends Methods,
> {
  public readonly id = Math.random().toString(36).slice(2)
  private readonly pendingRequests: Map<
    string,
    (response: ResponseMessage) => void
  > = new Map()

  constructor(
    private readonly listenMessenger: Messenger,
    private readonly postMessenger: Messenger,
    private readonly localMethods: MethodsToImplementations<LocalMethods>,
  ) {
    this.listenMessenger.addListener(this.handleMessage)
  }

  public destroy = () => {
    this.listenMessenger.removeListener(this.handleMessage)
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
      this.pendingRequests.set(id, (result) => {
        if ("result" in result) {
          resolve(result.result as any)
        } else if ("error" in result) {
          reject(result.error)
        } else {
          reject(new Error("Invalid response"))
        }
      })
      this.postMessenger.postMessage({
        id,
        type: "REQ",
        method: method.toString(),
        args,
        meta: {
          sender: this.id,
        },
      })
    })
  }

  private handleMessage = async (message: Message, origin: string) => {
    if (message.meta?.sender === this.id) {
      return
    }
    if (message.type === "REQ") {
      const method = this.localMethods[message.method]
      if (method) {
        try {
          const result = await method(origin)(...(message.args as any))
          this.postMessenger.postMessage({
            id: message.id,
            type: "RES",
            result,
          })
        } catch (error) {
          this.postMessenger.postMessage({
            id: message.id,
            type: "RES",
            error,
          })
        }
      }
    } else if (message.type === "RES") {
      const pendingRequest = this.pendingRequests.get(message.id)
      if (pendingRequest) {
        this.pendingRequests.delete(message.id)
        pendingRequest(message)
      }
    }
  }
}
