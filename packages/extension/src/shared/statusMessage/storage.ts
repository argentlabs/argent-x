import { KeyValueStorage } from "../storage"
import type { IStatusMessageStorage } from "./types"

export const statusMessageStore = new KeyValueStorage<IStatusMessageStorage>(
  {},
  {
    namespace: "service:statusMessage",
  },
)
