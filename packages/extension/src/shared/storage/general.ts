import { merge } from "lodash-es"
import browser from "webextension-polyfill"

type AllowPromise<T> = T | Promise<T>
type OptionalPropertiesOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K
  }[keyof T],
  undefined
>
type OnlyOptionalPropertiesOf<T extends object> = Required<
  Pick<T, OptionalPropertiesOf<T>>
>

export interface BaseStorage<T> {
  defaults: T
  namespace: string
  areaName: browser.storage.AreaName
}

export interface IStorage<T extends Record<string, any> = Record<string, any>>
  extends BaseStorage<T> {
  getItem<K extends keyof T>(key: K): Promise<T[K]>
  setItem<K extends keyof T>(key: K, value: T[K]): Promise<void>
  removeItem<K extends keyof T>(key: K): Promise<void>
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K]) => AllowPromise<void>,
  ): () => void
}

export type Implementations = Record<
  browser.storage.AreaName,
  browser.storage.StorageArea
> & { onChange: browser.storage.StorageChangedEvent }
export function getDefaultImplementations() {
  return merge(browser.storage, {
    onChange: browser.storage.onChanged, // somehow this is not available in the object
  })
}

export interface StorageOptions {
  namespace: string
  areaName?: browser.storage.AreaName
}
export type StorageOptionsOrNameSpace<
  T extends StorageOptions = StorageOptions,
> = string | T

export function getOptionsWithDefaults<T extends StorageOptionsOrNameSpace>(
  options: T,
): Required<StorageOptions> {
  const defaultOptions: OnlyOptionalPropertiesOf<StorageOptions> = {
    areaName: "session",
  }
  if (typeof options === "string") {
    return {
      ...defaultOptions,
      namespace: options,
    }
  }
  return {
    ...defaultOptions,
    ...options,
  }
}
export class Storage<T> implements IStorage<T> {
  private storageImplementation: browser.storage.StorageArea
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
