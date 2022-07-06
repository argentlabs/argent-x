import browser from "webextension-polyfill"

import {
  Implementations,
  StorageArea,
  getDefaultImplementations,
} from "./implementations"
import { StorageOptionsOrNameSpace, getOptionsWithDefaults } from "./options"
import { AllowPromise, BaseStorage } from "./types"

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
  public areaName: browser.storage.AreaName

  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace,
    private readonly implementations: Implementations = getDefaultImplementations(),
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.namespace = options.namespace
    this.areaName = options.areaName
    this.storageImplementation = implementations[options.areaName]

    if (!this.storageImplementation) {
      throw new Error(`Unknown storage area: ${options.areaName}`)
    }
  }

  private getStorageKey<K extends keyof T>(key: K): string {
    return this.namespace + ":" + key.toString()
  }

  public async getItem<K extends keyof T>(key: K): Promise<T[K]> {
    const storageKey = this.getStorageKey(key)
    const valueFromStorage = await this.storageImplementation.get(storageKey)
    return valueFromStorage[storageKey] ?? this.defaults[key]
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

    this.implementations.onChange.addListener(handler)

    return () => this.implementations.onChange.removeListener(handler)
  }
}
