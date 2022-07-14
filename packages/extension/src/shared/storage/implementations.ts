import browser from "webextension-polyfill"

import { AreaName } from "./types"

export type OnChanged = Pick<
  browser.storage.StorageChangedEvent,
  "addListener" | "removeListener"
>
export type StorageArea = Pick<
  browser.storage.StorageArea,
  "get" | "set" | "remove"
>

export type Implementations = Record<AreaName, StorageArea> & {
  onChanged: OnChanged
}

export function getDefaultImplementations(): Implementations {
  return browser.storage
}
