import Dexie, { Table } from "dexie"

export interface Device {
  id?: number
  signingKey: unknown
}

export class StoreDexie extends Dexie {
  devices!: Table<Device>

  constructor() {
    super("store")
    this.version(1).stores({
      devices: "id, signingKey",
    })
  }
}

export const idb = new StoreDexie()
