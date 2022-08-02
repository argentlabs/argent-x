import { KeyValueStorage } from "../storage"
import { IStatusMessageStorage } from "./types"

export const statusMessageStore = new KeyValueStorage<IStatusMessageStorage>(
  {},
  {
    namespace: "service:statusMessage",
  },
)
