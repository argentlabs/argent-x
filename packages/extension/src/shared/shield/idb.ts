import { Device } from "@argent/guardian"
import type { Table } from "dexie"
import Dexie from "dexie"

export class StoreDexie extends Dexie {
  devices!: Table<Device>

  constructor() {
    super("store")
    this.version(1).stores({
      devices: "id, signingKey, verifiedEmail, verifiedAt",
    })
  }
}

export const idb = new StoreDexie()
