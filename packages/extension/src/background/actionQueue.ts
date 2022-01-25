import oHash from "object-hash"

import { getFromStorage, setToStorage } from "./storage"

// eslint-disable-next-line @typescript-eslint/ban-types
function objectHash(obj: {} | null) {
  return oHash(obj, { unorderedArrays: true })
}
export interface QueueItem {
  meta: {
    hash: string
    expires: number
  }
}

export type ExtQueueItem<T> = QueueItem & T

interface QueueConfig<T> {
  onUpdate?: (items: ExtQueueItem<T>[]) => void
}

export async function getQueue<T extends object>(
  id: string,
  config: QueueConfig<T> = {},
) {
  const key = `QUEUE:${id}:ITEMS`

  async function getAll(): Promise<ExtQueueItem<T>[]> {
    const retrievedQueue = (await getFromStorage<ExtQueueItem<T>[]>(key)) ?? []

    const notExpiredQueue = retrievedQueue.filter(
      (item) => item.meta.expires > Date.now(),
    )

    // set queue to storage if it has changed
    if (retrievedQueue.length !== notExpiredQueue.length) {
      setToStorage(key, notExpiredQueue)
    }

    return notExpiredQueue
  }

  async function push(
    item: T,
    expires: number = 5 * 60 * 60 * 1000,
  ): Promise<ExtQueueItem<T>> {
    const hash = objectHash(item)
    const all = (await getAll()).filter((item) => item.meta.hash !== hash)
    const newItem = {
      ...item,
      meta: {
        hash,
        expires: Date.now() + expires,
      },
    }
    all.unshift(newItem)
    setToStorage(key, all)
    config.onUpdate?.(all)

    return newItem
  }

  async function remove(hash: string): Promise<ExtQueueItem<T> | null> {
    const all = await getAll()
    const hit = all.find((item) => item.meta.hash === hash)
    const filtered = all.filter((item) => item.meta.hash !== hash)
    setToStorage(key, filtered)
    config.onUpdate?.(filtered)
    return hit ?? null
  }

  return {
    getAll,
    push,
    remove,
  }
}
