import { isArray, isEqual, isFunction, isString } from "lodash-es"

import {
  AllowArray,
  AllowPromise,
  IObjectStore,
  IObjectStoreOptions,
  IRepository,
  IRepositoryOptions,
  SelectorFn,
  SetterFn,
  StorageChange,
  UpsertResult,
} from "../interface"
import { IKeyValueStorage } from "../.."

export class InMemoryObjectStore<T> implements IObjectStore<T> {
  public namespace: string

  private _data: T

  private _merge: Required<IObjectStoreOptions<T>>["merge"]

  private _subscribers: Set<(value: StorageChange<T>) => AllowPromise<void>> =
    new Set()

  constructor(options: IObjectStoreOptions<T>) {
    this.namespace = options.namespace
    this._data = options.defaults ? { ...options.defaults } : ({} as T)
    this._merge =
      options.merge || ((oldValue, newValue) => ({ ...oldValue, ...newValue }))

    if (options.deserialize || options.serialize) {
      throw new Error("Serialization is not supported in InMemoryObjectStore")
    }
  }

  async get(): Promise<T> {
    return this._data
  }

  async set(value: T): Promise<void> {
    // needs to be fixed for unit testing -- value reference between new and old is always the same
    const oldValue = this._data
    this._data = this._merge(oldValue, value)
    const change: StorageChange<T> = { oldValue, newValue: this._data }
    this._subscribers.forEach((subscriber) => {
      void subscriber(change)
    })
  }

  subscribe(
    callback: (value: StorageChange<T>) => AllowPromise<void>,
  ): () => void {
    this._subscribers.add(callback)
    return () => {
      this._subscribers.delete(callback)
    }
  }
}

export class InMemoryRepository<T> implements IRepository<T> {
  public namespace: string

  private _data: T[]

  private _compare: Required<IRepositoryOptions<T>>["compare"]

  private _subscribers: Set<
    (changeSet: StorageChange<T[]>) => AllowPromise<void>
  > = new Set()

  constructor(public readonly options: IRepositoryOptions<T>) {
    this.namespace = options.namespace
    this._data = options.defaults ? [...options.defaults] : []
    this._compare = options.compare ?? isEqual
  }

  async get(selector?: SelectorFn<T>): Promise<T[]> {
    return selector ? this._data.filter(selector) : this._data
  }

  async upsert(
    value: AllowArray<T> | SetterFn<T>,
    insertMode: "push" | "unshift" = "push",
  ): Promise<UpsertResult> {
    const oldValue = [...this._data]
    const items = isFunction(value)
      ? value(oldValue)
      : isArray(value)
        ? value
        : [value]

    let created = 0
    let updated = 0

    for (const item of items) {
      const index = this._data.findIndex((existing) =>
        this._compare(existing, item),
      )

      if (index >= 0) {
        this._data[index] = item
        updated++
      } else {
        this._data[insertMode](item)
        created++
      }
    }

    const change: StorageChange<T[]> = { oldValue, newValue: this._data }
    this._subscribers.forEach((subscriber) => {
      void subscriber(change)
    })

    return { created, updated }
  }

  async remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]> {
    const oldValue = [...this._data]
    const selector: SelectorFn<T> = isFunction(value)
      ? value
      : isArray(value)
        ? (item) => value.some((v) => this._compare(v, item))
        : (item) => this._compare(value, item)
    const removed: T[] = []

    this._data = this._data.filter((item) => {
      if (selector(item)) {
        removed.push(item)
        return false
      }
      return true
    })

    const change: StorageChange<T[]> = { oldValue, newValue: this._data }
    this._subscribers.forEach((subscriber) => {
      void subscriber(change)
    })

    return removed
  }

  subscribe(
    callback: (changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void {
    this._subscribers.add(callback)
    return () => {
      this._subscribers.delete(callback)
    }
  }
}

export class InMemoryKeyValueStore<T extends Record<string, any>>
  implements IKeyValueStorage<T>
{
  private _data: T
  private _subscribers: Map<
    keyof T,
    Set<(value: any, changeSet: StorageChange) => AllowPromise<void>>
  > = new Map()
  private _subscribersAll: Set<
    (changeSet: StorageChange) => AllowPromise<void>
  > = new Set()
  public namespace: string
  public areaName: "local" | "sync"
  public defaults: T

  constructor(options: IObjectStoreOptions<T>) {
    this.namespace = options.namespace
    this.areaName = "local"
    this._data = options.defaults ? { ...options.defaults } : ({} as T)
    this.defaults = options.defaults ?? ({} as T)

    if (options.deserialize || options.serialize) {
      throw new Error("Serialization is not supported in InMemoryObjectStore")
    }
  }

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    return this._data[key]
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const oldValue = this._data[key]
    this._data[key] = value

    const subscribers = this._subscribers.get(key)
    if (subscribers) {
      const change: StorageChange = { oldValue, newValue: value }
      subscribers.forEach((subscriber) => {
        void subscriber(value, change)
      })
    }
    this._subscribersAll.forEach((subscriberAll) => {
      const change: StorageChange = {
        oldValue: this._data,
        newValue: { ...this._data, [key]: value },
      }
      void subscriberAll(change)
    })
  }

  async delete<K extends keyof T>(key: K): Promise<void> {
    const oldValue = this._data[key]
    delete this._data[key]

    const subscribers = this._subscribers.get(key)
    if (subscribers) {
      const change: StorageChange = { oldValue, newValue: undefined }
      subscribers.forEach((subscriber) => {
        void subscriber(oldValue, change)
      })
    }
  }

  public subscribe<K extends keyof T>(
    ...args:
      | [
          key: K,
          callback: (
            value: T[K],
            changeSet: StorageChange,
          ) => AllowPromise<void>,
        ]
      | [callback: (changeSet: StorageChange<T>) => AllowPromise<void>]
  ) {
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
  ): () => void {
    let subscribers = this._subscribers.get(key as any)
    if (!subscribers) {
      subscribers = new Set()
      this._subscribers.set(key as any, subscribers)
    }

    subscribers.add(callback)

    return () => {
      subscribers?.delete(callback)
      if (subscribers && subscribers.size === 0) {
        this._subscribers.delete(key)
      }
    }
  }

  private subscribeAll(
    callback: (changeSet: StorageChange<any>) => AllowPromise<void>,
  ) {
    this._subscribersAll.add(callback)
    return () => {
      this._subscribersAll.delete(callback)
    }
  }
}
