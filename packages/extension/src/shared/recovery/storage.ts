import { KeyValueStorage } from "../storage"
import { adaptKeyValue } from "../storage/__new/keyvalue"
import { IRecoveryStorage } from "./types"

const keyValueStorage = new KeyValueStorage<IRecoveryStorage>(
  {
    isRecovering: false,
  },
  {
    namespace: "service:recovery",
  },
)

export const recoveryStore = adaptKeyValue(keyValueStorage)
