import { differenceWith, isEqual, isFunction } from "lodash-es"

import { ObjectStorage, ObjectStorageOptions } from "./object"
import { StorageOptionsOrNameSpace, getOptionsWithDefaults } from "./options"
import {
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
    const valuesToRemove = isFunction(value)
      ? await this.get(value)
      : Array.isArray(value)
        ? value
        : [value]
    const newAll = differenceWith(all, valuesToRemove, this.compare)
    await this.storageImplementation.set(newAll)
    return valuesToRemove
  }

  public subscribe(
    callback: (value: T[], changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void {
    return this.storageImplementation.subscribe(callback)
  }
}
