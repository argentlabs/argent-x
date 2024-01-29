import { partition } from "lodash-es"

import type { IRepository } from "../../storage/__new/interface"
import type { ActionQueueItemMeta } from "../schema"
import { isTransactionActionItem, type ExtQueueItem } from "../types"
import type { IActionQueue } from "./interface"
import { objectHash } from "../../objectHash"

type AllObjects = Record<string | number | symbol, unknown>

/**
 * @internal use `BackgroundActionService` methods instead
 */

const DEFAULT_EXPIRY_TIME_MS = 5 * 60 * 60 * 1000 // 5 hours
export const DEFAULT_APPROVAL_TIMEOUT_MS = 60 * 1000 // 1 minute

export function getActionQueue<T extends AllObjects>(
  storage: IRepository<ExtQueueItem<T>>,
): IActionQueue<T> {
  async function get(hash: string): Promise<ExtQueueItem<T> | null> {
    const all = await getAll() /** run expiry rules */
    return all.find((item) => item.meta.hash === hash) ?? null
  }

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

    // reset approval flags
    for (const item of notExpiredQueue) {
      if (
        item.meta.startedApproving &&
        Date.now() - item.meta.startedApproving > DEFAULT_APPROVAL_TIMEOUT_MS
      ) {
        const newItem = {
          ...item,
          meta: {
            ...item.meta,
            startedApproving: undefined,
            errorApproving: undefined,
          },
        }
        await storage.upsert(newItem)
      }
    }

    return notExpiredQueue
  }

  async function add<U extends T>(
    item: U,
    meta?: Partial<ActionQueueItemMeta>,
  ): Promise<ExtQueueItem<U>> {
    if (isTransactionActionItem(item) && !item.payload.createdAt) {
      /**
       * ensure same transaction shapes have a unique hash based on time,
       * e.g. swap tx may expire
       */
      item.payload.createdAt = Date.now()
    }
    const expires = meta?.expires || DEFAULT_EXPIRY_TIME_MS
    const hash = objectHash(item)
    const newItem = {
      ...item,
      meta: {
        ...meta,
        hash,
        expires: Date.now() + expires,
      },
    }

    await storage.upsert(newItem)

    return newItem
  }

  async function updateMeta(
    hash: string,
    meta: Partial<Omit<ActionQueueItemMeta, "hash" | "expires">>,
  ): Promise<ExtQueueItem<T> | null> {
    const item = await get(hash)

    if (!item) {
      return null
    }

    const newItem = {
      ...item,
      meta: {
        ...item.meta,
        ...meta,
      },
    }

    await storage.upsert(newItem)

    return newItem
  }

  async function remove(hash: string): Promise<ExtQueueItem<T> | null> {
    const [item] = await storage.remove((item) => item.meta.hash === hash)
    return item ?? null
  }

  async function removeAll() {
    await storage.remove(await storage.get())
  }

  return {
    get,
    getAll,
    add,
    updateMeta,
    remove,
    removeAll,
  }
}
