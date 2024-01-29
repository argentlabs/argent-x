import { KeyValueStorage } from "../storage"
import { adaptKeyValue } from "../storage/__new/keyvalue"
import type { IActivityStorage } from "./types"

const keyValueStorage = new KeyValueStorage<IActivityStorage>(
  {
    modifiedAfter: {},
  },
  {
    namespace: "service:activity",
  },
)

export const activityStore = adaptKeyValue(keyValueStorage)
