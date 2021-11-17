export interface Emit<M> {
  <K extends keyof M>(type: K, data: M[K]): any
}

export interface Dispatch<M> {
  (emit: Emit<M>): void
}

export class Messenger<M extends Record<string, any> = Record<string, any>> {
  actionArray: Emit<M>[] = []
  sender: Emit<M>
  constructor(listener: Dispatch<M>, sender: Emit<M>) {
    this.sender = sender

    listener((type, data) => {
      this.actionArray.forEach((action) => {
        action(type, data)
      })
    })
  }

  public listen: Dispatch<M> = (action) => {
    this.actionArray.push(action)
  }

  public unlisten: Dispatch<M> = (action) => {
    this.actionArray = this.actionArray.filter((a) => a !== action)
  }

  public waitForEvent(type: string, timeout = 5 * 60 * 1000): Promise<any> {
    return new Promise((res, rej) => {
      const pid = setTimeout(() => rej("waitForEvent timeout"), timeout)
      const handler: Emit<M> = (localType, data) => {
        if (localType === type) {
          this.unlisten(handler)
          clearTimeout(pid)
          res(data)
        }
      }
      this.listen(handler)
    })
  }

  public emit: Emit<M> = (type, data) => {
    this.sender(type, data)
  }
}
