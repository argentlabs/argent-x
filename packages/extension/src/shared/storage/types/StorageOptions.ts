import type { AreaName } from "."

export interface StorageOptions {
  namespace: string
  areaName?: AreaName
}
export type StorageOptionsOrNameSpace<
  T extends StorageOptions = StorageOptions,
> = string | T
