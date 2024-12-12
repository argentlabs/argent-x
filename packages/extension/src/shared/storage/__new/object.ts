import type { IObjectStore } from "./interface"
import type { IObjectStorage } from ".."

export function adaptObjectStorage<T>(
  storage: IObjectStorage<T>,
): IObjectStore<T> {
  const { namespace } = storage

  return {
    namespace,
    async get() {
      return storage.get()
    },
    async set(value) {
      await storage.set(value)
    },
    subscribe(callback) {
      // this is never fired, need to investigate and fix
      return storage.subscribe((_value, changeSet) => {
        void callback(changeSet)
      })
    },
  }
}
