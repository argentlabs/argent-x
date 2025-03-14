import type browser from "webextension-polyfill"

export type AllowPromise<T> = T | Promise<T>
export type AllowArray<T> = T | T[]

export type SelectorFn<T> = (value: T) => boolean
export type SetterFn<T> = (value: T[]) => T[]

export type OptionalPropertiesOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K
  }[keyof T],
  undefined
>
export type RequiredPropertiesOf<T extends object> = Exclude<
  keyof T,
  OptionalPropertiesOf<T>
>
export type OnlyOptionalPropertiesOf<T extends object> = Required<
  Pick<T, OptionalPropertiesOf<T>>
>

export type AreaName = browser.storage.AreaName

export interface BaseStorage<T> {
  defaults: T
  namespace: string
  areaName: AreaName
}

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

export interface StorageChange<T = any> {
  /** Optional. The new value of the item, if there is a new value. */
  newValue?: T
  /** Optional. The old value of the item, if there was an old value. */
  oldValue?: T
}
