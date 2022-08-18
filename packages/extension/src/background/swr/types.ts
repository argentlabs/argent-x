import { IKeyValueStorage } from "../../shared/storage/keyvalue"

export type StaleWhileRevalidateCache = <TReturnValue>(
  cacheKey: string | (() => string),
  fn: () => TReturnValue,
) => Promise<TReturnValue>

export interface Config {
  minTimeToStale?: number
  maxTimeToLive?: number
  storage: IKeyValueStorage
  serialize?: (value: unknown) => unknown
  deserialize?: (value: unknown) => unknown
}
