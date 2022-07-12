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

export type AreaName = Exclude<chrome.storage.AreaName, "session"> // FIXME: session storage is not supported in manifest v2

export interface BaseStorage<T> {
  defaults: T
  namespace: string
  areaName: AreaName
}
