import { KeyValueStorage } from "../storage"
import { adaptKeyValue } from "../storage/__new/keyvalue"
import type { IRecoveryStorage } from "./types"

const keyValueStorage = new KeyValueStorage<IRecoveryStorage>(
  {
    isRecovering: false,
    errorRecovering: false,
    isClearingStorage: false,
  },
  {
    namespace: "service:recovery",
  },
)

export const recoveryStore = adaptKeyValue(keyValueStorage)

export const recoveredAtKeyValueStore = new KeyValueStorage<{
  lastRecoveredAt: number | null
}>(
  { lastRecoveredAt: null },
  {
    namespace: "core:recoveredAt",
    areaName: "local",
  },
)
export const recoveredAtStore = adaptKeyValue(recoveredAtKeyValueStore)
