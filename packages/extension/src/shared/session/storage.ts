import { KeyValueStorage } from "../storage"

export interface ISessionStore {
  isUnlocked: boolean
}

export const sessionStore = new KeyValueStorage<ISessionStore>(
  {
    isUnlocked: false,
  },
  { namespace: "core:sessionStore", areaName: "session" },
)
