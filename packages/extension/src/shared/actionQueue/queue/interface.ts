import { ActionQueueItemMeta } from "../schema"
import { ExtQueueItem } from "../types"

export interface IActionQueue<T> {
  get: (hash: string) => Promise<ExtQueueItem<T> | null>
  getAll: () => Promise<ExtQueueItem<T>[]>
  add: <U extends T>(
    item: U,
    meta?: Partial<ActionQueueItemMeta>,
  ) => Promise<ExtQueueItem<U>>
  updateMeta: (
    hash: string,
    meta: Partial<Omit<ActionQueueItemMeta, "hash" | "expires">>,
  ) => Promise<ExtQueueItem<T> | null>
  remove: (hash: string) => Promise<ExtQueueItem<T> | null>
  removeAll: () => Promise<void>
}
