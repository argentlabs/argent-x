import type { KeyValueStorage } from "../keyvalue"
import type { IObjectStore, StorageChange } from "./interface"

export function adaptKeyValue<T extends Record<string, any>>(
  storage: KeyValueStorage<T>,
): IObjectStore<T> {
  return {
    namespace: storage.namespace, // Set a default namespace value or set it as a parameter of the adapter function
    async get(): Promise<T> {
      const storedKeys = await storage.getStoredKeys()
      const defaults = storage.defaults
      const storedValues = await Promise.all(
        storedKeys.map(async (key) => {
          const value = await storage.get(key)
          return { [key]: value }
        }),
      )
      return Object.assign({}, defaults, ...storedValues)
    },
    async set(value: T): Promise<void> {
      const old = await this.get()

      const changes = Object.keys(value).reduce((acc, key: keyof T) => {
        if (value[key] !== old[key]) {
          acc[key] = value[key]
        }
        return acc
      }, {} as Partial<T>)

      await Promise.all(
        Object.keys(changes).map(async (key: keyof T) => {
          await storage.set(key, changes[key] as T[keyof T])
        }),
      )

      // because subscribe is debounce for one tick, we should wait 1 tick before resolving the set
      await new Promise((resolve) => setTimeout(resolve, 0))
    },
    subscribe(
      callback: (value: StorageChange<Partial<T>>) => void,
    ): () => void {
      /** coalesce changes in same event loop */
      let oldValue: T | undefined
      let isScheduled = false

      const queuedCallback = () => {
        void this.get().then((newValue) => {
          callback({
            oldValue,
            newValue,
          })
          oldValue = newValue
          isScheduled = false
        })
      }

      const unsub = storage.subscribe(() => {
        if (!isScheduled) {
          isScheduled = true
          queueMicrotask(queuedCallback)
        }
      })

      // Initialize oldValue
      void this.get().then((value) => {
        oldValue = value
      })

      return unsub
    },
  }
}
