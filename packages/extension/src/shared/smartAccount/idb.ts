import type { Table } from "dexie"
import Dexie from "dexie"

import type { Device } from "@argent/x-guardian"

export class StoreDexie extends Dexie {
  devices!: Table<Device>
  ids!: Table<{ key: string; id: string }>
  constructor() {
    super("store")
    this.version(2).stores({
      devices: "id, signingKey, verifiedEmail, verifiedAt",
      ids: "key, id",
    })
  }
}

export const idb = new StoreDexie()
