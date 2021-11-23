import { InvokeFunctionTransaction } from "starknet"

import { getFromStorage, setToStorage } from "./storage"

export interface QueueItem {
  meta?: {
    expires?: number
  }
}

export type ActionItem = QueueItem &
  (
    | {
        type: "CONNECT"
        payload: {
          host: string
        }
      }
    | {
        type: "TRANSACTION"
        payload: InvokeFunctionTransaction
      }
  )

export async function getQueue<T extends QueueItem>(id: string) {
  const key = `QUEUE:${id}:ITEMS`

  async function getAll(): Promise<T[]> {
    return (await getFromStorage<T[]>(key)) ?? []
  }

  async function push(item: T) {
    const all = await getAll()
    all.push(item)
    return setToStorage(key, all)
  }

  async function getLatest(): Promise<T | null> {
    const all = await getAll()
    return all.shift() ?? null
  }

  async function removeLatest() {
    const [, ...rest] = await getAll()
    return setToStorage(key, rest)
  }

  async function length(): Promise<number> {
    const all = await getAll()
    return all.length
  }

  return {
    getAll,
    push,
    getLatest,
    removeLatest,
    length,
  }
}
