import browser from "webextension-polyfill"

import { MockStorage } from "./__test__/chrome-storage.mock"
import type { StorageOptionsOrNameSpace } from "./options"
import { getOptionsWithDefaults } from "./options"
import type {
  AllowPromise,
  AreaName,
  BaseStorage,
  StorageArea,
  StorageChange,
} from "./types"
import { isFunction, isString } from "lodash-es"

export interface IKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> extends BaseStorage<T> {
  get<K extends keyof T>(key: K): Promise<T[K]>
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>
  delete<K extends keyof T>(key: K): Promise<void>
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

export const isMockStorage = (storage: StorageArea): storage is MockStorage => {
  return storage instanceof MockStorage
}

export class KeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> implements IKeyValueStorage<T>
{
  private storageImplementation: StorageArea | browser.storage.StorageArea
  public namespace: string
  public areaName: AreaName

  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace,
    storageImplementation?: StorageArea | browser.storage.StorageArea,
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.namespace = options.namespace
    this.areaName = options.areaName
    if (storageImplementation) {
      this.storageImplementation = storageImplementation
      return
    }
    try {
      this.storageImplementation = browser.storage[options.areaName]
      if (!this.storageImplementation) {
        throw new Error()
      }
    } catch {
      if (options.areaName === "session") {
        const { manifest_version } = browser.runtime.getManifest()
        if (manifest_version === 2) {
          console.log("[v2] Polyfill for browser.storage.session")
          this.storageImplementation = new MockStorage("session") // for manifest v2
          return
        }
      }
      throw new Error(`Unknown storage area: ${options.areaName}`)
    }
  }

  private getStorageKeyPrefix(): string {
    return this.namespace + ":"
  }

  private getStorageKey<K extends keyof T>(key: K): string {
    return this.getStorageKeyPrefix() + key.toString()
  }

  public async get<K extends keyof T>(key: K): Promise<T[K]> {
    const storageKey = this.getStorageKey(key)
    try {
      const valueFromStorage = await this.storageImplementation.get(storageKey)
      return valueFromStorage[storageKey] ?? this.defaults[key]
    } catch (e: any) {
      if (e?.toString().includes("Error in invocation of storage.get")) {
        return this.defaults[key]
      }
      throw e
    }
  }
  public async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.set({ [storageKey]: value })
  }

  public async delete<K extends keyof T>(key: K): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.remove(storageKey)
  }

  public subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
  public subscribe(
    callback: (changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
  public subscribe<K extends keyof T>(
    ...args:
      | [
          key: K,
          callback: (
            value: T[K],
            changeSet: StorageChange,
          ) => AllowPromise<void>,
        ]
      | [callback: (changeSet: StorageChange) => AllowPromise<void>]
  ): () => void {
    if (args.length === 2 && isString(args[0]) && isFunction(args[1])) {
      return this.subscribeKey(args[0], args[1])
    }
    if (args.length === 1 && isFunction(args[0])) {
      return this.subscribeAll(args[0])
    }
    throw new Error("Invalid subscribe arguments")
  }

  private subscribeKey<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ) {
    const storageKey = this.getStorageKey(key)

    /** storage for manifest v2 */
    if (isMockStorage(this.storageImplementation)) {
      const handler = (changes: Record<string, StorageChange>) => {
        if (changes[storageKey]) {
          void callback(
            changes[storageKey].newValue ?? this.defaults[key], // if newValue is undefined, it means the value was deleted from storage, so we use the default value
            changes[storageKey],
          )
        }
      }

      this.storageImplementation.onChanged.addListener(handler)

      return () => {
        if (isMockStorage(this.storageImplementation)) {
          this.storageImplementation.onChanged.removeListener(handler)
        }
      }
    }

    const handler = (
      changes: Record<string, StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName && changes[storageKey]) {
        void callback(
          changes[storageKey].newValue ?? this.defaults[key], // if newValue is undefined, it means the value was deleted from storage, so we use the default value
          changes[storageKey],
        )
      }
    }

    browser.storage.onChanged.addListener(handler)

    return () => browser.storage.onChanged.removeListener(handler)
  }

  /** convert all changes into one payload for the single storage key */
  private deriveChanges(
    changes: Record<string, StorageChange>,
    storageKeyPrefix = this.getStorageKeyPrefix(),
  ) {
    let hasChanges = false
    const derivedChanges: StorageChange = {
      newValue: {},
      oldValue: {},
    }
    for (const [key, value] of Object.entries(changes)) {
      if (!key.startsWith(storageKeyPrefix)) {
        continue
      }
      const storageKey = key.substring(storageKeyPrefix.length)
      derivedChanges.newValue[storageKey] = value.newValue ?? this.defaults[key] // if newValue is undefined, it means the value was deleted from storage, so we use the default value
      if (value.oldValue !== undefined) {
        derivedChanges.oldValue[storageKey] = value.oldValue
      }
      hasChanges = true
    }
    if (hasChanges) {
      return derivedChanges
    }
  }

  private subscribeAll(
    callback: (changeSet: StorageChange) => AllowPromise<void>,
  ) {
    /** storage for manifest v2 */
    if (isMockStorage(this.storageImplementation)) {
      const handler = (changes: Record<string, StorageChange>) => {
        const derivedChanges = this.deriveChanges(changes)
        if (derivedChanges) {
          void callback(derivedChanges)
        }
      }

      this.storageImplementation.onChanged.addListener(handler)

      return () => {
        if (isMockStorage(this.storageImplementation)) {
          this.storageImplementation.onChanged.removeListener(handler)
        }
      }
    }

    const handler = (
      changes: Record<string, StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName) {
        const derivedChanges = this.deriveChanges(changes)
        if (derivedChanges) {
          void callback(derivedChanges)
        }
      }
    }

    browser.storage.onChanged.addListener(handler)

    return () => browser.storage.onChanged.removeListener(handler)
  }

  /**
   * @internal for migration purposes only
   */
  public async getStoredKeys(): Promise<string[]> {
    const items = await this.storageImplementation.get(null)
    return Object.keys(items)
      .filter((key) => key.startsWith(this.namespace))
      .map((key) => key.replace(this.namespace + ":", ""))
  }
}
