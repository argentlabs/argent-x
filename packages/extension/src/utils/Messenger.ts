export type EmitFn = (type: string, data: any) => void

export type DispatchFn = (emit: EmitFn) => void

export class Messenger {
  actionArray: EmitFn[] = []
  sender: EmitFn
  constructor(listener: DispatchFn, sender: EmitFn) {
    this.sender = sender

    listener((type, data) => {
      this.actionArray.forEach((action) => {
        action(type, data)
      })
    })
  }

  public listen: DispatchFn = (action) => {
    this.actionArray.push(action)
  }

  public unlisten: DispatchFn = (action) => {
    this.actionArray = this.actionArray.filter((a) => a !== action)
  }

  public waitForEvent(type: string, timeout = 5 * 60 * 1000): Promise<any> {
    return new Promise((res, rej) => {
      const pid = setTimeout(() => rej("waitForEvent timeout"), timeout)
      const handler: EmitFn = (localType, data) => {
        if (localType === type) {
          this.unlisten(handler)
          clearTimeout(pid)
          res(data)
        }
      }
      this.listen(handler)
    })
  }

  public emit: EmitFn = (type, data) => {
    this.sender(type, data)
  }
}
