import type { Message, Messenger } from "../messenger"

export class Relayer {
  public id = Math.random().toString(36).slice(2)

  constructor(
    private readonly messenger1: Messenger,
    private readonly messenger2: Messenger,
  ) {
    this.messenger1.addListener(this.forwardMessageTo2)
    this.messenger2.addListener(this.forwardMessageTo1)
  }

  public destroy = () => {
    this.messenger1.removeListener(this.forwardMessageTo2)
    this.messenger2.removeListener(this.forwardMessageTo1)
  }

  private forwardMessageTo1 = (message: Message) => {
    // this is an extra method so the function reference is stable
    return this.forwardMessage(this.messenger1, message)
  }

  private forwardMessageTo2 = (message: Message) => {
    // this is an extra method so the function reference is stable
    return this.forwardMessage(this.messenger2, message)
  }

  private forwardMessage = (to: Messenger, message: Message) => {
    const forwardedBy =
      message.meta && Array.isArray(message.meta.forwardedBy)
        ? message.meta.forwardedBy
        : []

    if (forwardedBy.includes(this.id)) {
      return
    }

    return to.postMessage({
      ...message,
      meta: {
        ...message.meta,
        forwardedBy: [...forwardedBy, this.id],
      },
    })
  }
}
