import { KeyValueStorage } from "../storage"
import { DebounceService } from "./DebounceService"

const debounceStorage = new KeyValueStorage(
  {},
  {
    namespace: "core:debounce",
    areaName: "local",
  },
)

export const debounceService = new DebounceService(debounceStorage)

export type { IDebounceService } from "./IDebounceService"
