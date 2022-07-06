import {
  differenceWith,
  isEqual,
  isFunction,
  reverse,
  uniqWith,
} from "lodash-es"

import { Implementations, getDefaultImplementations } from "./implementations"
import { ObjectStorage, ObjectStorageOptions } from "./object"
import { StorageOptionsOrNameSpace, getOptionsWithDefaults } from "./options"
import {
  AllowArray,
  AllowPromise,
  BaseStorage,
  SelectorFn,
  SetterFn,
} from "./types"

export function mergeArrayStableWith<T>(
  source: T[],
  other: T[],
  compareFn: (a: T, b: T) => boolean = isEqual,
): T[] {
  const result = reverse(uniqWith(reverse(source), compareFn)) // 2x reverse to keep the order while keeping the last occurence of duplicates
  for (const element of other) {
    const index = result.findIndex((e) => compareFn(e, element))
    if (index === -1) {
      result.push(element)
    } else {
      result[index] = element
    }
  }
  return result
}

interface ArrayStorageOptions<T> extends ObjectStorageOptions<T[]> {
  compare?: (a: T, b: T) => boolean
}

export interface IArrayStorage<T> extends BaseStorage<T[]> {
  get(selector?: SelectorFn<T>): Promise<T[]>
  add(value: AllowArray<T> | SetterFn<T>): Promise<void>
  remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]>
  subscribe(callback: (value: T[]) => AllowPromise<void>): () => void
}

// implement ArrayStorage using ObjectStorage as a base
export class ArrayStorage<T> implements IArrayStorage<T> {
  public namespace: string
  public areaName: chrome.storage.AreaName

  private readonly storageImplementation: ObjectStorage<T[]>
  private readonly compare: (a: T, b: T) => boolean

  constructor(
    public readonly defaults: T[],
    optionsOrNamespace: StorageOptionsOrNameSpace<ArrayStorageOptions<T>>,
    implementations: Implementations = getDefaultImplementations(),
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.compare = options.compare ?? isEqual

    this.storageImplementation = new ObjectStorage<T[]>(
      this.defaults,
      optionsOrNamespace,
      implementations,
    )
    this.areaName = this.storageImplementation.areaName
    this.namespace = this.storageImplementation.namespace
  }

  public async get(selector?: SelectorFn<T>): Promise<T[]> {
    const all = await this.storageImplementation.get()
    if (selector) {
      return all.filter(selector)
    }
    return all
  }

  public async add(value: AllowArray<T> | SetterFn<T>): Promise<void> {
    const all = await this.get()
    const newValue = isFunction(value)
      ? value(all)
      : Array.isArray(value)
      ? value
      : [value]
    const newAll = mergeArrayStableWith(all, newValue, this.compare)
    await this.storageImplementation.set(newAll)
  }

  public async remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]> {
    const all = await this.get()
    const valuesToRemove = isFunction(value)
      ? await this.get(value)
      : Array.isArray(value)
      ? value
      : [value]
    const newAll = differenceWith(all, valuesToRemove, this.compare)
    await this.storageImplementation.set(newAll)
    return valuesToRemove
  }

  public subscribe(callback: (value: T[]) => AllowPromise<void>): () => void {
    return this.storageImplementation.subscribe(callback)
  }
}
