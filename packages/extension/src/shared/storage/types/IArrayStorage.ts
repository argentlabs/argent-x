import type { ObjectStorageOptions } from "./IObjectStorage"
import type {
  BaseStorage,
  SelectorFn,
  AllowArray,
  SetterFn,
  StorageChange,
  AllowPromise,
} from "."

export interface ArrayStorageOptions<T> extends ObjectStorageOptions<T[]> {
  compare?: (a: T, b: T) => boolean
}

export interface IArrayStorage<T> extends BaseStorage<T[]> {
  get(selector?: SelectorFn<T>): Promise<T[]>
  push(value: AllowArray<T> | SetterFn<T>): Promise<void>
  unshift(value: AllowArray<T> | SetterFn<T>): Promise<void>
  remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]>
  subscribe(
    callback: (value: T[], changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void
}
