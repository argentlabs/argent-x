import type { Table } from "dexie"
import Dexie from "dexie"
import type { GenerateKeyPairResult } from "jose"

export interface Device {
  id?: number
  signingKey: GenerateKeyPairResult
  encryptionKey: GenerateKeyPairResult
  /** presence of email indicates that the email has been verified by 2fa with backend */
  verifiedEmail?: string
  /** ISO date string of when the email was verified */
  verifiedAt?: string
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
