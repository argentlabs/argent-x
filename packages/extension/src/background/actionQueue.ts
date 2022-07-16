import { partition } from "lodash-es"
import oHash from "object-hash"

import { ExtQueueItem } from "../shared/actionQueue/types"
import type { IArrayStorage } from "../shared/storage/array"

function objectHash(obj: object | null) {
  return oHash(obj, { unorderedArrays: true })
}

type AllObjects = Record<string | number | symbol, unknown>

export interface Queue<T> {
  getAll: () => Promise<ExtQueueItem<T>[]>
  push: (item: T, expires?: number) => Promise<ExtQueueItem<T>>
  remove: (hash: string) => Promise<ExtQueueItem<T> | null>
}

export async function getQueue<T extends AllObjects>(
  storage: IArrayStorage<ExtQueueItem<T>>,
): Promise<Queue<T>> {
  async function getAll(): Promise<ExtQueueItem<T>[]> {
    const allInQueue = await storage.get()
    const [notExpiredQueue, expiredItems] = partition(
      allInQueue,
      (item) => item.meta.expires > Date.now(),
    )

    // set queue to storage if it has changed
    if (expiredItems.length) {
      await storage.remove(expiredItems)
    }

    return notExpiredQueue
  }

  async function push(
    item: T,
    expires: number = 5 * 60 * 60 * 1000, // 5 hours
  ): Promise<ExtQueueItem<T>> {
    const hash = objectHash(item)
    const newItem = {
      ...item,
      meta: {
        hash,
        expires: Date.now() + expires,
      },
    }

    await storage.unshift(newItem)

    return newItem
  }

  async function remove(hash: string): Promise<ExtQueueItem<T> | null> {
    const [item] = await storage.remove((item) => item.meta.hash === hash)
    return item ?? null
  }

  return {
    getAll,
    push,
    remove,
  }
}
