import { ActionQueueItemMeta } from "../schema"
import { ExtQueueItem } from "../types"

export interface IActionQueue<T> {
  get: (hash: string) => Promise<ExtQueueItem<T> | null>
  getAll: () => Promise<ExtQueueItem<T>[]>
  add: <U extends T>(
    item: U,
    meta?: Partial<ActionQueueItemMeta>,
  ) => Promise<ExtQueueItem<U>>
  addFront: <U extends T>(
    item: U,
    meta?: Partial<ActionQueueItemMeta>,
  ) => Promise<ExtQueueItem<U>>
  update: (
    hash: string,
    updatedItem: Partial<{
      meta: Partial<Omit<ActionQueueItemMeta, "hash" | "expires">>
    }> &
      Partial<T>,
  ) => Promise<ExtQueueItem<T> | null>
  updateMeta: (
    hash: string,
    meta: Partial<Omit<ActionQueueItemMeta, "hash" | "expires">>,
  ) => Promise<ExtQueueItem<T> | null>
  remove: (hash: string) => Promise<ExtQueueItem<T> | null>
  removeAll: () => Promise<void>
}
