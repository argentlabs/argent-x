import type { IStorage } from "../storage"

export type StaleWhileRevalidateCache = <TReturnValue>(
  cacheKey: string | (() => string),
  fn: () => TReturnValue,
) => Promise<TReturnValue>

export interface Config {
  minTimeToStale?: number
  maxTimeToLive?: number
  storage: IStorage
  serialize?: (value: unknown) => unknown
  deserialize?: (value: unknown) => unknown
}
