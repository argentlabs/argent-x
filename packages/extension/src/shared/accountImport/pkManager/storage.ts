import { KeyValueStorage } from "../../storage"
import { adaptKeyValue } from "../../storage/__new/keyvalue"
import type { IPKStore } from "../types"

const keyValueStorage = new KeyValueStorage<IPKStore>(
  {
    keystore: {},
  },
  {
    namespace: "service:pkManager",
  },
)

/**
 * @internal
 * This storage is intended to be used only by the PKManager for storing encrypted keys.
 */
export const pkStore = adaptKeyValue(keyValueStorage)
