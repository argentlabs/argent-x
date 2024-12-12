import { isArray, isEqual, isFunction, partition } from "lodash-es"

import type { ObjectStorageOptions } from "./object"
import { ObjectStorage } from "./object"
import type { StorageOptionsOrNameSpace } from "./options"
import { getOptionsWithDefaults } from "./options"
import type {
  AllowArray,
  AllowPromise,
  AreaName,
  BaseStorage,
  SelectorFn,
  SetterFn,
  StorageChange,
} from "./types"
import { mergeArrayStableWith } from "./__new/base"

interface ArrayStorageOptions<T> extends ObjectStorageOptions<T[]> {
  compare?: (a: T, b: T) => boolean
}

export interface IArrayStorage<T> extends BaseStorage<T[]> {
  get(selector?: SelectorFn<T>): Promise<T[]>
  push(value: AllowArray<T> | SetterFn<T>): Promise<void>
  unshift(value: AllowArray<T> | SetterFn<T>): Promise<void>
  remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]>
  subscribe(
    callback: (value: T[], changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void
}

// implement ArrayStorage using ObjectStorage as a base
export class ArrayStorage<T> implements IArrayStorage<T> {
  public namespace: string
  public areaName: AreaName

  private readonly storageImplementation: ObjectStorage<T[]>
  private readonly compare: (a: T, b: T) => boolean

  constructor(
    public readonly defaults: T[],
    optionsOrNamespace: StorageOptionsOrNameSpace<ArrayStorageOptions<T>>,
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.compare = options.compare ?? isEqual

    this.storageImplementation = new ObjectStorage<T[]>(
      this.defaults,
      optionsOrNamespace,
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

  private setterOrArrayToValue(
    setterOrArray: AllowArray<T> | SetterFn<T>,
    setterArg: T[],
  ): T[] {
    return isFunction(setterOrArray)
      ? setterOrArray(setterArg)
      : Array.isArray(setterOrArray)
        ? setterOrArray
        : [setterOrArray]
  }

  public async push(value: AllowArray<T> | SetterFn<T>): Promise<void> {
    const all = await this.get()
    const newValue = this.setterOrArrayToValue(value, all)
    const newAll = mergeArrayStableWith(all, newValue, {
      compareFn: this.compare.bind(this),
      insertMode: "push",
    })
    await this.storageImplementation.set(newAll)
  }

  public async unshift(value: AllowArray<T> | SetterFn<T>): Promise<void> {
    const all = await this.get()
    const newValue = this.setterOrArrayToValue(value, all)
    const newAll = mergeArrayStableWith(all, newValue, {
      compareFn: this.compare.bind(this),
      insertMode: "unshift",
    })
    await this.storageImplementation.set(newAll)
  }

  /**
   * Remove on or multiple values from the array
   *
   * @param value can be a selector function or an array of values to remove
   * @returns the removed values
   */
  public async remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]> {
    const all = await this.get()
    const compareFn = this.compare.bind(this)

    const selector = isFunction(value)
      ? (item: T) => !value(item)
      : isArray(value)
        ? (item: T) => !value.some((v) => compareFn(v, item))
        : (item: T) => !compareFn(value, item)

    const [keptValues, removedValues] = partition(all, selector)
    await this.storageImplementation.set(keptValues)
    return removedValues
  }

  public subscribe(
    callback: (value: T[], changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void {
    return this.storageImplementation.subscribe(callback)
  }
}
