/**
 * Represents a value of type T or a Promise of type T.
 */
export type AllowPromise<T> = T | Promise<T>

/**
 * Represents a value of type T or an array of type T.
 */
export type AllowArray<T> = T | T[]

/**
 * A function that takes a value of type T and returns a boolean.
 */
export type SelectorFn<T> = (value: T) => boolean

/**
 * A function that takes an array of values of type T and returns an array of values of type T.
 */
export type SetterFn<T> = (value: T[]) => T[]

/**
 * Represents a change in storage, including the old and new values.
 */
export interface StorageChange<T = any> {
  /** Optional. The new value of the item, if there is a new value. */
  newValue?: T
  /** Optional. The old value of the item, if there was an old value. */
  oldValue?: T
}

/**
 * Represents options for creating a new repository.
 */
export interface IRepositoryOptions<T> {
  /** The namespace for the repository. */
  namespace: string
  /** Optional. The default values for the repository. */
  defaults?: T[]
  /** Optional. A function that serializes a value of type T. */
  serialize?: (value: T[]) => any
  /** Optional. A function that deserializes a value to type T. */
  deserialize?: (value: any) => AllowPromise<T[]>
  /** Optional. A function that compares two values of type T and returns a boolean. */
  compare?: (a: T, b: T) => boolean
  /** Optional. A function that merges two values of type T. */
  merge?: (oldValue: T, newValue: T) => T
}

export type UpsertResult = { created: number; updated: number }

/**
 * Represents a repository for managing data of type T.
 */
export interface IRepository<T> {
  /** The namespace for the repository. */
  namespace: string

  /**
   * Retrieves items from the repository based on the provided selector function.
   * @param selector - Optional. A function that filters the items to be retrieved.
   * @returns A Promise that resolves to an array of items of type T.
   */
  get(selector?: SelectorFn<T>): Promise<T[]>

  /**
   * Inserts or updates items in the repository.
   * @param value - An array of items, a single item, or a setter function that operates on an array of items.
   * @returns A Promise that resolves to a boolean indicating whether the operation succeeded.
   */
  upsert(
    value: AllowArray<T> | SetterFn<T>,
    insertMode?: "push" | "unshift",
  ): Promise<UpsertResult>

  /**
   * Removes items from the repository based on the provided value or selector function.
   * @param value - An array of items, a single item, or a selector function that filters the items to be removed.
   * @returns A Promise that resolves to an array of removed items of type T.
   */
  remove(value: AllowArray<T> | SelectorFn<T>): Promise<T[]>

  /**
   * Subscribes to changes in the repository.
   * @param callback - A function that gets called when there are changes in the repository.
   * @returns A function that can be called to unsubscribe from the changes.
   */
  subscribe(
    callback: (changeSet: StorageChange<T[]>) => AllowPromise<void>,
  ): () => void
}

export interface IObjectStoreOptions<T> {
  namespace: string
  /** Optional. The default values for the repository. */
  defaults?: T
  /** Optional. A function that serializes a value of type T. */
  serialize?: (value: T) => any
  /** Optional. A function that deserializes a value to type T. */
  deserialize?: (value: any) => AllowPromise<T>
  /** Optional. A function that merges two values of type T. */
  merge?: (oldValue: T, newValue: Partial<T>) => T
}

export interface IObjectStore<T> {
  namespace: string
  get(): Promise<T>
  set(value: Partial<T>): Promise<void>
  subscribe(
    callback: (value: StorageChange<Partial<T>>) => AllowPromise<void>,
  ): () => void
}
