import browser from "webextension-polyfill"

import { MockStorage } from "./__test__/chrome-storage.mock"
import { StorageOptionsOrNameSpace, getOptionsWithDefaults } from "./options"
import {
  AllowPromise,
  AreaName,
  BaseStorage,
  StorageArea,
  StorageChange,
} from "./types"

export interface IKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> extends BaseStorage<T> {
  get<K extends keyof T>(key: K): Promise<T[K]>
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>
  delete<K extends keyof T>(key: K): Promise<void>
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
}

export class KeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> implements IKeyValueStorage<T>
{
  private storageImplementation: StorageArea
  public namespace: string
  public areaName: AreaName

  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace,
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.namespace = options.namespace
    this.areaName = options.areaName
    try {
      this.storageImplementation = browser.storage[options.areaName]
      if (!this.storageImplementation) {
        throw new Error()
      }
    } catch (e) {
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

  private getStorageKey<K extends keyof T>(key: K): string {
    return this.namespace + ":" + key.toString()
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
  ): () => void {
    const storageKey = this.getStorageKey(key)

    const handler = async (
      changes: Record<string, StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName && changes[storageKey]) {
        callback(
          changes[storageKey].newValue ?? this.defaults[key], // if newValue is undefined, it means the value was deleted from storage, so we use the default value
          changes[storageKey],
        )
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
