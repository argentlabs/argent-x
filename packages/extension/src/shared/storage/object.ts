import type { StorageOptionsOrNameSpace } from "./types/StorageOptions"
import type { ObjectStorageOptions } from "./types/IObjectStorage"
import { ObjectStorageBase } from "./objectbase"
import { KeyValueStorage } from "./keyvalue"

export class ObjectStorage<T> extends ObjectStorageBase<T> {
  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace<ObjectStorageOptions<T>>,
  ) {
    super(defaults, optionsOrNamespace, KeyValueStorage)
  }
}
