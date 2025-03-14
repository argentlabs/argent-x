import type { StorageOptionsOrNameSpace } from "./types/StorageOptions"
import type { ArrayStorageOptions } from "./types/IArrayStorage"
import { ArrayStorageBase } from "./arraybase"
import { KeyValueStorage } from "./keyvalue"

export class ArrayStorage<T> extends ArrayStorageBase<T> {
  constructor(
    public readonly defaults: T[],
    optionsOrNamespace: StorageOptionsOrNameSpace<ArrayStorageOptions<T>>,
  ) {
    super(defaults, optionsOrNamespace, KeyValueStorage)
  }
}
