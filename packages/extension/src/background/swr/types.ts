import type { IStorage } from "../storage"

export interface Config {
  minTimeToStale?: number
  maxTimeToLive?: number
  storage: IStorage
  serialize?: (value: any) => any
  deserialize?: (value: any) => any
}
