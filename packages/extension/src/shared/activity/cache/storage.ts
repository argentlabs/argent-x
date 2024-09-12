import { KeyValueStorage } from "../../storage"
import { adaptKeyValue } from "../../storage/__new/keyvalue"
import type { IActivityCacheStorage } from "./IActivityCacheStorage"

const keyValueStorage = new KeyValueStorage<IActivityCacheStorage>(
  {
    cache: {},
  },
  {
    namespace: "service:activityCache",
  },
)

export const activityCacheStore = adaptKeyValue(keyValueStorage)
