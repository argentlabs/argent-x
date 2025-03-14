import type { StorageOptions } from "./StorageOptions"
import type { AllowPromise, BaseStorage, StorageChange } from "."

export interface ObjectStorageOptions<T> extends StorageOptions {
  serialize?: (value: T) => any
  deserialize?: (value: any) => AllowPromise<T>
  merge?: (oldValue: T, newValue: T) => T
}
export type SetterFn<T> = (value: T) => Partial<T>

export interface IObjectStorage<T> extends BaseStorage<T> {
  get(): Promise<T>
  set(value: Partial<T> | SetterFn<T>): Promise<void>
  subscribe(
    callback: (value: T, changeSet: StorageChange<T>) => AllowPromise<void>,
  ): () => void
}
