import { WildcardHandler, mittx } from "starknetkit/window"
import { isFunction } from "lodash-es"

import {
  AreaName,
  Implementations,
  OnChanged,
  StorageArea,
  StorageChange,
} from "../types"

type Events = Record<AreaName, Record<string, StorageChange>>
const emitter = mittx<Events>()

function getChangeMap(oldValue?: any, newValue?: any): StorageChange {
  const changeMap: StorageChange = {
    oldValue,
    newValue,
  }
  return changeMap
}

export class MockStorage implements StorageArea, chrome.storage.StorageArea {
  private store = new Map()

  public QUOTA_BYTES = 1024 * 1024 * 1024

  constructor(private readonly area: AreaName) {}

  clear(): Promise<void>
  clear(callback?: (() => void) | undefined): void
  clear(callback?: unknown): void | Promise<void> {
    this.store.clear()
    emitter.emit(this.area, {})
    if (isFunction(callback)) {
      return callback()
    }
    return Promise.resolve()
  }

  remove(keys: string | string[]): Promise<void>
  remove(keys: string | string[], callback?: (() => void) | undefined): void
  remove(keys: unknown, callback?: unknown): void | Promise<void> {
    if (Array.isArray(keys)) {
      const itemsToRemove = Array.from(this.store.entries()).filter(([key]) =>
        keys.includes(key),
      )
      keys.forEach((key) => this.store.delete(key))
      emitter.emit(
        this.area,
        Object.fromEntries(
          itemsToRemove.map(([key, value]) => [
            key,
            getChangeMap(value, undefined),
          ]),
        ),
      )
    } else {
      const oldValue = this.store.get(keys)
      this.store.delete(keys)
      emitter.emit(this.area, {
        [keys as string]: getChangeMap(oldValue, undefined),
      })
    }
    if (isFunction(callback)) {
      return callback()
    }
    return Promise.resolve()
  }

  get(callback: (items: { [key: string]: any }) => void): void
  get(
    keys?: string | string[] | { [key: string]: any } | null | undefined,
  ): Promise<{ [key: string]: any }>
  get(
    keys: string | string[] | { [key: string]: any } | null,
    callback: (items: { [key: string]: any }) => void,
  ): void
  get(
    keys?: unknown,
    callback?: unknown,
  ): void | Promise<{ [key: string]: any }> {
    if (isFunction(keys)) {
      callback = keys as (items: { [key: string]: any }) => void
      keys = undefined
    }
    const returnObject = Object.fromEntries(
      Array.from(this.store.entries()).filter(([key]) => {
        return (
          (keys as null | undefined | string | string[])?.includes(key) ?? true
        )
      }),
    )
    if (isFunction(callback)) {
      return callback(returnObject)
    }
    return Promise.resolve(returnObject)
  }

  set(items: { [key: string]: any }): Promise<void>
  set(items: { [key: string]: any }, callback?: (() => void) | undefined): void
  set(items: { [key: string]: any }, callback?: unknown): void | Promise<void> {
    const entries = Object.entries(items)
    const changeMap = entries.reduce(
      (acc, [key, value]) => {
        acc[key] = getChangeMap(this.store.get(key), value)
        return acc
      },
      {} as Record<string, StorageChange>,
    )
    for (const [key, value] of entries) {
      this.store.set(key, value)
    }
    emitter.emit(this.area, changeMap)

    if (isFunction(callback)) {
      return callback()
    }
    return Promise.resolve()
  }

  onChanged: chrome.storage.StorageAreaChangedEvent = {
    addListener: (callback) => {
      emitter.on(this.area, callback)
    },
    hasListener: (callback) => {
      return Boolean(
        emitter.all.get(this.area)?.some((handler) => handler === callback),
      )
    },
    hasListeners: () => {
      return Boolean(emitter.all.get(this.area)?.length)
    },
    removeListener: (callback) => {
      emitter.off(this.area, callback)
    },
    addRules: () => {
      throw new Error("Method not implemented.")
    },
    getRules: () => {
      throw new Error("Method not implemented.")
    },
    removeRules: () => {
      throw new Error("Method not implemented.")
    },
  }

  getBytesInUse(callback: (bytesInUse: number) => void): void
  getBytesInUse(keys?: string | string[] | null | undefined): Promise<number>
  getBytesInUse(
    keys: string | string[] | null,
    callback: (bytesInUse: number) => void,
  ): void
  getBytesInUse(keys?: unknown, callback?: unknown): void | Promise<number> {
    if (isFunction(keys)) {
      callback = keys as (bytesInUse: number) => void
      keys = undefined
    }
    if (isFunction(callback)) {
      return callback(0)
    }
    return Promise.resolve(0)
  }

  setAccessLevel(accessOptions: {
    accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS"
  }): Promise<void>
  setAccessLevel(
    accessOptions: {
      accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS"
    },
    callback: () => void,
  ): void
  setAccessLevel(
    accessOptions: unknown,
    callback?: unknown,
  ): void | Promise<void> {
    if (isFunction(callback)) {
      return callback()
    }
    return Promise.resolve()
  }
}

type Callback = (
  changes: {
    [key: string]: StorageChange
  },
  areaName: "sync" | "local" | "managed" | "session",
) => void
const listenersSet = new Map<Callback, WildcardHandler<Events>>()
const onStorageChange: OnChanged = {
  addListener(callback) {
    const handler: WildcardHandler<Events> = (type, event) => {
      callback(event, type)
    }
    listenersSet.set(callback, handler)
    emitter.on("*", handler)
  },
  removeListener(callback) {
    const handler = listenersSet.get(callback)
    if (handler) {
      emitter.off("*", handler)
    }
  },
}

export const chromeStorageMock: Implementations = {
  local: new MockStorage("local"),
  sync: new MockStorage("sync"),
  managed: new MockStorage("managed"),
  session: new MockStorage("session"),
  onChanged: onStorageChange,
}
