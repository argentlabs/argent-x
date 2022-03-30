import oHash from "object-hash"

function objectHash(obj: object | null) {
  return oHash(obj, { unorderedArrays: true })
}

interface Overrides {
  [key: string]: any
}
export interface QueueItem {
  meta: {
    hash: string
    expires: number
  }
  override?: Overrides
}

export type ExtQueueItem<T> = QueueItem & T

interface QueueConfig<T> {
  onUpdate?: (items: ExtQueueItem<T>[]) => void
}

// in-memory queue is better than localStorage, because it's way faster and persistance is not required
let globalQueue: ExtQueueItem<any>[] = []

export async function getQueue<T extends object>(config: QueueConfig<T> = {}) {
  async function getAll(): Promise<ExtQueueItem<T>[]> {
    const notExpiredQueue = globalQueue.filter(
      (item) => item.meta.expires > Date.now(),
    )

    // set queue to storage if it has changed
    if (globalQueue.length !== notExpiredQueue.length) {
      globalQueue = notExpiredQueue
    }

    return notExpiredQueue
  }

  async function push(
    item: T,
    expires: number = 5 * 60 * 60 * 1000,
  ): Promise<ExtQueueItem<T>> {
    const hash = objectHash(item)
    const existsAlready = globalQueue.some((item) => item.meta.hash === hash)
    const newItem = {
      ...item,
      meta: {
        hash,
        expires: Date.now() + expires,
      },
    }
    if (!existsAlready) {
      globalQueue.unshift(newItem)
      config.onUpdate?.(globalQueue)
    }

    return newItem
  }

  async function override(
    hash: string,
    overrides: Overrides,
  ): Promise<ExtQueueItem<T> | undefined> {
    const item = globalQueue.find((item) => item.meta.hash === hash)
    if (item) {
      item.override = overrides
      config.onUpdate?.(globalQueue)
    }
    return item
  }

  async function remove(hash: string): Promise<ExtQueueItem<T> | null> {
    const hit = globalQueue.find((item) => item.meta.hash === hash)
    globalQueue = globalQueue.filter((item) => item.meta.hash !== hash)
    config.onUpdate?.(globalQueue)
    return hit ?? null
  }

  return {
    getAll,
    push,
    override,
    remove,
  }
}
