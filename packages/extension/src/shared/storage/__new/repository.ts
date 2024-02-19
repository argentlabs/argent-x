import {
  AllowArray,
  AllowPromise,
  IRepository,
  SelectorFn,
  SetterFn,
  StorageChange,
  UpsertResult,
} from "./interface"
import { ArrayStorage } from ".."

export function adaptArrayStorage<T>(storage: ArrayStorage<T>): IRepository<T> {
  return {
    namespace: storage.namespace,

    async get(selector?: SelectorFn<T>): Promise<T[]> {
      return storage.get(selector)
    },

    async upsert(
      value: AllowArray<T> | SetterFn<T>,
      insertMode: "push" | "unshift" = "push",
    ): Promise<UpsertResult> {
      await storage[insertMode](value)
      return { created: Date.now(), updated: Date.now() }
    },

    async remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]> {
      return storage.remove(value)
    },

    subscribe(
      callback: (changeSet: StorageChange<T[]>) => AllowPromise<void>,
    ): () => void {
      return storage.subscribe((_value: T[], changeSet: StorageChange<T[]>) =>
        callback(changeSet),
      )
    },
  }
}
