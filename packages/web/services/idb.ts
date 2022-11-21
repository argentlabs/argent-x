import Dexie, { Table } from "dexie"
import { GenerateKeyPairResult, KeyLike } from "jose"

export interface Device {
  id?: number
  signingKey: GenerateKeyPairResult | string
  encryptionKey: GenerateKeyPairResult
}

export class StoreDexie extends Dexie {
  devices!: Table<Device>

  constructor() {
    super("store")
    this.version(1).stores({
      devices: "id, signingKey, encryptionKey",
    })
  }
}

export const idb = new StoreDexie()
