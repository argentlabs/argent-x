import { cloneDeep, isPlainObject, merge } from "lodash-es"

import type { IKeyValueStorage } from "./types/IKeyValueStorage"
import type { StorageOptionsOrNameSpace } from "./types/StorageOptions"
import type { AllowPromise, AreaName, StorageChange } from "./types"
import type {
  IObjectStorage,
  ObjectStorageOptions,
  SetterFn,
} from "./types/IObjectStorage"

export class ObjectStorageBase<T> implements IObjectStorage<T> {
  public namespace: string
  public areaName: AreaName

  private storageImplementation: IKeyValueStorage<{ inner: T }>
  private serialize: (value: T) => any
  private deserialize: (value: any) => AllowPromise<T>
  private merge: (oldValue: T, newValue: T) => T

  /**
   * ObjectStorage constructor
   *
   * @note default values must always be serialized
   * @param defaults default value for the storage (must be already serialized)
   * @param optionsOrNamespace options for the storage
   */
  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace<ObjectStorageOptions<T>>,
    KeyValueStorageConstructor: new (
      ...args: any[]
    ) => IKeyValueStorage<{ inner: T }>,
  ) {
    const passThrough = (value: any) => value
    function defaultMerge(oldValue: T, newValue: T) {
      if (isPlainObject(oldValue) && isPlainObject(newValue)) {
        return cloneDeep(merge(oldValue, newValue))
      }
      return newValue
    }
    if (isPlainObject(optionsOrNamespace)) {
      const options = optionsOrNamespace as ObjectStorageOptions<T>
      this.serialize = options.serialize ?? passThrough
      this.deserialize = options.deserialize ?? passThrough
      this.merge = options.merge ?? defaultMerge
    } else {
      this.serialize = passThrough
      this.deserialize = passThrough
      this.merge = defaultMerge
    }

    this.storageImplementation = new KeyValueStorageConstructor(
      {
        inner: this.serialize(this.defaults),
      },
      optionsOrNamespace,
    )

    this.areaName = this.storageImplementation.areaName
    this.namespace = this.storageImplementation.namespace
  }

  public async get(): Promise<T> {
    return this.deserialize(await this.storageImplementation.get("inner"))
  }

  public async set(setter: Partial<T> | SetterFn<T>): Promise<void> {
    const oldState = await this.get()
    const value = typeof setter === "function" ? setter(oldState) : setter
    return this.storageImplementation.set(
      "inner",
      await this.serialize(this.merge(oldState, value as T)),
    )
  }

  private async deserializeChangeSet(
    changeSet: StorageChange,
  ): Promise<StorageChange<T>> {
    return {
      ...(changeSet.oldValue && {
        oldValue: await this.deserialize(changeSet.oldValue),
      }),
      ...(changeSet.newValue && {
        newValue: await this.deserialize(changeSet.newValue),
      }),
    }
  }

  public subscribe(
    callback: (value: T, changeSet: StorageChange<T>) => AllowPromise<void>,
  ): () => void {
    return this.storageImplementation.subscribe("inner", async (t, c) => {
      return callback(
        await this.deserialize(t),
        await this.deserializeChangeSet(c),
      )
    })
  }
}
