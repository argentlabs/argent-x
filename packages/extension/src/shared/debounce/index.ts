import { KeyValueStorage } from "../storage"
import { DebounceService } from "./chrome"

const debounceStorage = new KeyValueStorage(
  {},
  {
    namespace: "core:debounce",
    areaName: "local",
  },
)

export const debounceService = new DebounceService(debounceStorage)

export { IDebounceService } from "./interface"
