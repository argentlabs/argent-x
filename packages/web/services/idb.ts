import Dexie, { Table } from "dexie"
import { GenerateKeyPairResult, KeyLike } from "jose"

export interface Device {
  id?: number
  signingKey: GenerateKeyPairResult | string
  encryptionKey: GenerateKeyPairResult
}

export interface Session {
  id?: number
  encryptionKey: GenerateKeyPairResult
  expiresAt: number
}

export class StoreDexie extends Dexie {
  devices!: Table<Device>
  session!: Table<Session>

  constructor() {
    super("store")
    this.version(1).stores({
      devices: "id, signingKey, encryptionKey",
      session: "id, encryptionKey",
    })
  }
}

export const idb = new StoreDexie()
