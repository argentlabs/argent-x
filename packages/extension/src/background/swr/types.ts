import type { IStorage } from "../storage"

export type StaleWhileRevalidateCache = <ReturnValue>(
  cacheKey: string | (() => string),
  fn: () => ReturnValue,
) => Promise<ReturnValue>

export interface Config {
  minTimeToStale?: number
  maxTimeToLive?: number
  storage: IStorage
  serialize?: (value: any) => any
  deserialize?: (value: any) => any
}
