import type { BaseStorage, AllowPromise, StorageChange } from "."

export interface IKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> extends BaseStorage<T> {
  get<K extends keyof T>(key: K): AllowPromise<T[K]>
  set<K extends keyof T>(key: K, value: T[K]): AllowPromise<void>
  delete<K extends keyof T>(key: K): AllowPromise<void>
  /** subscribe to changes for a single key */
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
  /** subscribe to all changes */
  subscribe(
    callback: (changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
}
