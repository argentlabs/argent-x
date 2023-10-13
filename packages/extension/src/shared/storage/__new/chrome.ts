import { isFunction, partition } from "lodash-es"

import { mergeArrayStableWith, optionsWithDefaults } from "./base"
import type {
  AllowArray,
  AllowPromise,
  IRepository,
  IRepositoryOptions,
  SelectorFn,
  SetterFn,
  StorageChange,
  UpsertResult,
} from "./interface"
import { DeepPick } from "../../types/deepPick"

interface ChromeRepositoryOptions {
  areaName: chrome.storage.AreaName
}

type AnyStorageArea =
  | chrome.storage.SyncStorageArea
  | chrome.storage.StorageArea
  | chrome.storage.LocalStorageArea
  | chrome.storage.SessionStorageArea

type MinimalBrowser = DeepPick<typeof chrome, "storage">

export class ChromeRepository<T> implements IRepository<T> {
  public readonly namespace: string
  private readonly browser: MinimalBrowser
  private readonly storage: AnyStorageArea
  private readonly options: Required<IRepositoryOptions<T>> &
    ChromeRepositoryOptions

  constructor(
    chrome: MinimalBrowser,
    options: IRepositoryOptions<T> & ChromeRepositoryOptions,
  ) {
    this.browser = chrome
    this.options = optionsWithDefaults(options)
    this.storage = this.browser.storage[this.options.areaName]
    this.namespace = `repository:${this.options.namespace}`
  }

  private getStorage = async (): Promise<T[]> => {
    const all = await this.storage.get(this.namespace)
    const values = all[this.namespace]

    if (!values) {
      return this.options.defaults
    }

    return this.options.deserialize(values)
  }

  async get(selector?: (value: T) => boolean): Promise<T[]> {
    const items = await this.getStorage()
    if (selector) {
      return items.filter(selector)
    }

    return items
  }

  private async set(value: T[]): Promise<void> {
    return this.storage.set({
      [this.namespace]: await this.options.serialize(value),
    })
  }

  async remove(value: SelectorFn<T> | AllowArray<T>): Promise<T[]> {
    const items = await this.getStorage()
    const values = Array.isArray(value) ? value : [value]

    const removeSelector = isFunction(value)
      ? value
      : (item: T) => values.includes(item)

    const [newValues, removedValues] = partition(items, removeSelector)
    await this.set(newValues)
    return removedValues
  }

  async upsert(value: AllowArray<T> | SetterFn<T>): Promise<UpsertResult> {
    // use mergeArrayStableWith to merge the new values with the existing values
    const items = await this.getStorage()

    let newValues: T[]
    if (isFunction(value)) {
      newValues = value(items)
    } else if (Array.isArray(value)) {
      newValues = value
    } else {
      newValues = [value]
    }

    const mergedValues = mergeArrayStableWith(
      items,
      newValues,
      this.options.compare,
    )

    await this.set(mergedValues)

    return {
      created: newValues.length - items.length,
      updated: items.length - newValues.length,
    }
  }

  subscribe(
    callback: (changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void {
    const onChange = (
      changes: { [key: string]: StorageChange<T[]> },
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== this.options.areaName) {
        return
      }

      const changeSet = changes[this.namespace]

      if (!changeSet) {
        return
      }

      const asyncCb = async () => {
        return callback({
          newValue: changeSet.newValue
            ? await this.options.deserialize(changeSet.newValue)
            : changeSet.newValue,
          oldValue: changeSet.oldValue
            ? await this.options.deserialize(changeSet.oldValue)
            : changeSet.oldValue,
        })
      }

      void asyncCb()
    }

    this.browser.storage.onChanged.addListener(onChange)

    return () => {
      this.browser.storage.onChanged.removeListener(onChange)
    }
  }
}
