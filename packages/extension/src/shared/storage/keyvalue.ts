import browser from "webextension-polyfill"

import { StorageOptionsOrNameSpace, getOptionsWithDefaults } from "./options"
import { AllowPromise, AreaName, BaseStorage, StorageArea } from "./types"

export interface IKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> extends BaseStorage<T> {
  getItem<K extends keyof T>(key: K): Promise<T[K]>
  setItem<K extends keyof T>(key: K, value: T[K]): Promise<void>
  removeItem<K extends keyof T>(key: K): Promise<void>
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K]) => AllowPromise<void>,
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
    this.storageImplementation = browser.storage[options.areaName]

    if (!this.storageImplementation) {
      throw new Error(`Unknown storage area: ${options.areaName}`)
    }
  }

  private getStorageKey<K extends keyof T>(key: K): string {
    return this.namespace + ":" + key.toString()
  }

  public async getItem<K extends keyof T>(key: K): Promise<T[K]> {
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
  public async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.set({ [storageKey]: value })
  }

  public async removeItem<K extends keyof T>(key: K): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.remove(storageKey)
  }

  public subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K]) => AllowPromise<void>,
  ): () => void {
    const storageKey = this.getStorageKey(key)

    const handler = async (
      changes: Record<string, browser.storage.StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName && changes[storageKey]) {
        callback(changes[storageKey].newValue)
      }
    }

    browser.storage.onChanged.addListener(handler)

    return () => browser.storage.onChanged.removeListener(handler)
  }
}
