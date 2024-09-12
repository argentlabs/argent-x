import { KeyValueStorage } from "../storage"
import { adaptKeyValue } from "../storage/__new/keyvalue"
import type { IDiscoverStorage } from "./IDiscoverStorage"

const keyValueStorage = new KeyValueStorage<IDiscoverStorage>(
  {
    viewedAt: 0,
    data: null,
  },
  {
    namespace: "service:discover",
  },
)

export const discoverStore = adaptKeyValue(keyValueStorage)
