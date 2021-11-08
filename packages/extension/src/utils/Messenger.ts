type EmitFn = (type: string, data: any) => void

type DispatchFn = (emit: EmitFn) => void

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

  public emit: EmitFn = (type, data) => {
    this.sender(type, data)
  }
}
