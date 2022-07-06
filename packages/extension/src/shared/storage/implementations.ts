import { merge } from "lodash-es"

export type OnChange = Pick<
  chrome.storage.StorageChangedEvent,
  "addListener" | "removeListener"
>
export type StorageArea = Pick<
  chrome.storage.StorageArea,
  "get" | "set" | "remove"
>

export type Implementations = Record<chrome.storage.AreaName, StorageArea> & {
  onChange: OnChange
}

export function getDefaultImplementations(): Implementations {
  return merge(chrome.storage, {
    onChange: chrome.storage.onChanged, // somehow this is not available in the object
  })
}
