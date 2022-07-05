import { isObject, merge } from "lodash-es"

import {
  BaseStorage,
  Implementations,
  Storage,
  StorageOptions,
  StorageOptionsOrNameSpace,
  getDefaultImplementations,
} from "./general"

type AllowPromise<T> = T | Promise<T>

interface ObjectStorageOptions<T> extends StorageOptions {
  serialize?: (value: T) => any
  deserialize?: (value: any) => T
  merge?: (oldValue: T, newValue: T) => T
}

type SetterFn<T> = (value: T) => Partial<T>

export interface ObjectStorage<T> extends BaseStorage<T> {
  get(): Promise<T>
  set(value: Partial<T> | SetterFn<T>): Promise<void>
  subscribe(callback: (value: T) => AllowPromise<void>): () => void
}

export class ObjectStorage<T> implements ObjectStorage<T> {
  public namespace: string
  public areaName: chrome.storage.AreaName

  private storageImplementation: Storage<{ inner: T }>
  private serialize: (value: T) => any
  private deserialize: (value: any) => T
  private merge: (oldValue: T, newValue: T) => T

  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace<ObjectStorageOptions<T>>,
    implementations: Implementations = getDefaultImplementations(),
  ) {
    const passThrough = (value: any) => value
    function defaultMerge(oldValue: T, newValue: T) {
      if (isObject(oldValue)) {
        return merge(oldValue, newValue)
      }
      return newValue
    }
    if (isObject(optionsOrNamespace)) {
      const options = optionsOrNamespace as ObjectStorageOptions<T>
      this.serialize = options.serialize ?? passThrough
      this.deserialize = options.deserialize ?? passThrough
      this.merge = options.merge ?? defaultMerge
    } else {
      this.serialize = passThrough
      this.deserialize = passThrough
      this.merge = defaultMerge
    }

    this.storageImplementation = new Storage<{
      inner: T
    }>(
      {
        inner: this.serialize(this.defaults),
      },
      optionsOrNamespace,
      implementations,
    )

    this.areaName = this.storageImplementation.areaName
    this.namespace = this.storageImplementation.namespace
  }

  public async get(): Promise<T> {
    return this.deserialize(await this.storageImplementation.getItem("inner"))
  }

  public async set(setter: Partial<T> | SetterFn<T>): Promise<void> {
    const oldState = await this.get()
    const value = typeof setter === "function" ? setter(oldState) : setter
    return this.storageImplementation.setItem(
      "inner",
      this.serialize(this.merge(oldState, value as T)),
    )
  }

  public subscribe(callback: (value: T) => AllowPromise<void>): () => void {
    return this.storageImplementation.subscribe("inner", (t) => {
      return callback(this.deserialize(t))
    })
  }
}
