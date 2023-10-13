import { isArray, isEqual, isFunction } from "lodash-es"

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

  async upsert(value: AllowArray<T> | SetterFn<T>): Promise<UpsertResult> {
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
        this._data.push(item)
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
