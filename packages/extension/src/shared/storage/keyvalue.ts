import browser from "webextension-polyfill"

import { MockStorage } from "./__test__/chrome-storage.mock"
import type { StorageOptionsOrNameSpace } from "./types/StorageOptions"
import { getOptionsWithDefaults } from "./options"
import type {
  AllowPromise,
  AreaName,
  StorageArea,
  StorageChange,
} from "./types"
import { isFunction, isString } from "lodash-es"
import type { IKeyValueStorage } from "./types/IKeyValueStorage"

interface KeyValueStorageOptions {
  version?: number
  migrations?: Record<number, (oldValue: any) => any>
}

export const isMockStorage = (storage: StorageArea): storage is MockStorage => {
  return storage instanceof MockStorage
}

export class KeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
> implements IKeyValueStorage<T>
{
  private storageImplementation: StorageArea | browser.storage.StorageArea
  public namespace: string
  public areaName: AreaName
  private migrationPromise: Promise<void> | null = null
  private readonly options: StorageOptionsOrNameSpace & KeyValueStorageOptions

  constructor(
    public readonly defaults: T,
    optionsOrNamespace: StorageOptionsOrNameSpace & KeyValueStorageOptions,
    storageImplementation?: StorageArea | browser.storage.StorageArea,
  ) {
    const options = getOptionsWithDefaults(optionsOrNamespace)
    this.options = options
    this.namespace = options.namespace
    this.areaName = options.areaName
    if (storageImplementation) {
      this.storageImplementation = storageImplementation
      return
    }
    try {
      this.storageImplementation = browser.storage[options.areaName]
      if (!this.storageImplementation) {
        throw new Error()
      }
    } catch {
      if (options.areaName === "session") {
        const { manifest_version } = browser.runtime.getManifest()
        if (manifest_version === 2) {
          console.log("[v2] Polyfill for browser.storage.session")
          this.storageImplementation = new MockStorage("session") // for manifest v2
          return
        }
      }
      throw new Error(`Unknown storage area: ${options.areaName}`)
    }
  }

  private getStorageKeyPrefix(): string {
    return this.namespace + ":"
  }

  private getStorageKey<K extends keyof T>(key: K): string {
    return this.getStorageKeyPrefix() + key.toString()
  }

  private getMetaKey = () => this.getStorageKeyPrefix() + "$meta"

  private async getMeta(): Promise<{ version?: number }> {
    const metaKey = this.getMetaKey()
    const all = await this.storageImplementation.get(metaKey)
    return all[metaKey] || {}
  }

  private async setMeta(meta: { version?: number }): Promise<void> {
    const metaKey = this.getMetaKey()
    return this.storageImplementation.set({ [metaKey]: meta })
  }

  private async getRawValue<K extends keyof T>(key: K): Promise<T[K]> {
    const storageKey = this.getStorageKey(key)
    const valueFromStorage = await this.storageImplementation.get(storageKey)
    return valueFromStorage[storageKey] ?? this.defaults[key]
  }

  private async setRawValue<K extends keyof T>(
    key: K,
    value: T[K],
  ): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.set({ [storageKey]: value })
  }

  private async deleteRawValue<K extends keyof T>(key: K): Promise<void> {
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.remove(storageKey)
  }

  private async getAllData(): Promise<T> {
    const allKeys = await this.getStoredKeys()

    const relevantKeys = allKeys.filter((key) => !key.endsWith("$meta"))

    if (relevantKeys.length === 0) {
      return this.defaults
    }

    // Build result object using reduce
    const result = await relevantKeys.reduce(
      async (accPromise, key) => {
        const acc = await accPromise
        const value = await this.getRawValue(key as keyof T)
        return { ...acc, [key]: value }
      },
      Promise.resolve({} as Partial<T>),
    )

    return { ...this.defaults, ...result }
  }

  private async setAllData(value: T): Promise<void> {
    const storedKeys = await this.getStoredKeys()
    const prefix = this.getStorageKeyPrefix()

    // Remove old keys that are not in new value
    await Promise.all(
      storedKeys
        .filter((key) => key.startsWith(prefix) && !key.endsWith("$meta"))
        .map((key) => {
          const storageKey = key.replace(prefix, "") as keyof T
          if (!(storageKey in value)) {
            return this.deleteRawValue(storageKey)
          }
        }),
    )

    // Set new values
    await Promise.all(
      Object.entries(value).map(([key, val]) =>
        this.setRawValue(key as keyof T, val),
      ),
    )
  }

  private async migrate(): Promise<void> {
    const targetVersion = this.options.version || 1
    if (targetVersion < 1) {
      throw new Error("Version cannot be less than 1")
    }

    const meta = await this.getMeta()
    const currentVersion = meta.version || 1

    if (currentVersion > targetVersion) {
      throw new Error(
        `Version downgrade detected (v${currentVersion} -> v${targetVersion}) for "${this.namespace}"`,
      )
    }

    if (currentVersion === targetVersion) {
      return
    }

    // Get all current data
    const allData = await this.getAllData()

    console.debug(
      `[KeyValueStorage] Starting migration for ${this.namespace}: v${currentVersion} -> v${targetVersion}`,
      { allData },
    )

    const migrationsToRun = Array.from(
      { length: targetVersion - currentVersion },
      (_, i) => currentVersion + i + 1,
    )

    let migratedValue = { ...allData }
    for (const migrateToVersion of migrationsToRun) {
      try {
        const migrationFn = this.options.migrations?.[migrateToVersion]
        if (migrationFn) {
          console.debug(
            `[KeyValueStorage] Running migration v${migrateToVersion} for ${this.namespace}`,
            {
              before: migratedValue,
            },
          )

          const result = await migrationFn(migratedValue)
          migratedValue = { ...result }

          console.debug(
            `[KeyValueStorage] Completed migration v${migrateToVersion} for ${this.namespace}`,
            {
              after: migratedValue,
            },
          )
        }
      } catch (err) {
        throw new Error(
          `v${migrateToVersion} migration failed for "${this.namespace}"`,
          {
            cause: err,
          },
        )
      }
    }

    // First update version
    await this.setMeta({ version: targetVersion })

    // Then save all migrated data
    await this.setAllData(migratedValue)

    console.debug(
      `[KeyValueStorage] Migration completed for ${this.namespace} v${targetVersion}`,
      { migratedValue },
    )
  }

  private async ensureMigrated(): Promise<void> {
    if (!this.options.version) {
      return
    }

    if (!this.migrationPromise) {
      this.migrationPromise = this.migrate()
    }

    await this.migrationPromise
  }

  public async get<K extends keyof T>(key: K): Promise<T[K]> {
    await this.ensureMigrated()
    const storageKey = this.getStorageKey(key)
    try {
      const valueFromStorage = await this.storageImplementation.get(storageKey)
      return valueFromStorage[storageKey] ?? this.defaults[key]
    } catch (e: any) {
      if (e?.toString().includes("Error in invocation of storage.get")) {
        return this.defaults[key]
      }
      throw e
    }
  }

  public async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.ensureMigrated()
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.set({ [storageKey]: value })
  }

  public async delete<K extends keyof T>(key: K): Promise<void> {
    await this.ensureMigrated()
    const storageKey = this.getStorageKey(key)
    return this.storageImplementation.remove(storageKey)
  }

  public subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
  public subscribe(
    callback: (changeSet: StorageChange) => AllowPromise<void>,
  ): () => void
  public subscribe<K extends keyof T>(
    ...args:
      | [
          key: K,
          callback: (
            value: T[K],
            changeSet: StorageChange,
          ) => AllowPromise<void>,
        ]
      | [callback: (changeSet: StorageChange) => AllowPromise<void>]
  ): () => void {
    if (args.length === 2 && isString(args[0]) && isFunction(args[1])) {
      return this.subscribeKey(args[0], args[1])
    }
    if (args.length === 1 && isFunction(args[0])) {
      return this.subscribeAll(args[0])
    }
    throw new Error("Invalid subscribe arguments")
  }

  private subscribeKey<K extends keyof T>(
    key: K,
    callback: (value: T[K], changeSet: StorageChange) => AllowPromise<void>,
  ) {
    const storageKey = this.getStorageKey(key)

    /** storage for manifest v2 */
    if (isMockStorage(this.storageImplementation)) {
      const handler = (changes: Record<string, StorageChange>) => {
        if (changes[storageKey]) {
          const defaultValue = this.defaults[key]
          const change = changes[storageKey]
          const updatedChange = {
            ...change,
            oldValue: change.oldValue ?? defaultValue,
            newValue: change.newValue ?? defaultValue,
          }
          void callback(updatedChange.newValue, updatedChange)
        }
      }

      this.storageImplementation.onChanged.addListener(handler)

      return () => {
        if (isMockStorage(this.storageImplementation)) {
          this.storageImplementation.onChanged.removeListener(handler)
        }
      }
    }

    const handler = (
      changes: Record<string, StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName && changes[storageKey]) {
        const defaultValue = this.defaults[key]
        const change = changes[storageKey]
        const updatedChange = {
          ...change,
          oldValue: change.oldValue ?? defaultValue,
          newValue: change.newValue ?? defaultValue,
        }
        void callback(updatedChange.newValue, updatedChange)
      }
    }

    browser.storage.onChanged.addListener(handler)

    return () => browser.storage.onChanged.removeListener(handler)
  }

  /** convert all changes into one payload for the single storage key */
  private deriveChanges(
    changes: Record<string, StorageChange>,
    storageKeyPrefix = this.getStorageKeyPrefix(),
  ) {
    let hasChanges = false
    const derivedChanges: StorageChange = {
      newValue: {},
      oldValue: {},
    }
    for (const [key, value] of Object.entries(changes)) {
      if (!key.startsWith(storageKeyPrefix)) {
        continue
      }
      const storageKey = key.substring(storageKeyPrefix.length)
      const defaultValue = this.defaults[storageKey]
      derivedChanges.newValue[storageKey] = value.newValue ?? defaultValue
      derivedChanges.oldValue[storageKey] = value.oldValue ?? defaultValue
      hasChanges = true
    }
    if (hasChanges) {
      return derivedChanges
    }
  }

  private subscribeAll(
    callback: (changeSet: StorageChange) => AllowPromise<void>,
  ) {
    /** storage for manifest v2 */
    if (isMockStorage(this.storageImplementation)) {
      const handler = (changes: Record<string, StorageChange>) => {
        const derivedChanges = this.deriveChanges(changes)
        if (derivedChanges) {
          void callback(derivedChanges)
        }
      }

      this.storageImplementation.onChanged.addListener(handler)

      return () => {
        if (isMockStorage(this.storageImplementation)) {
          this.storageImplementation.onChanged.removeListener(handler)
        }
      }
    }

    const handler = (
      changes: Record<string, StorageChange>,
      areaName: browser.storage.AreaName,
    ) => {
      if (this.areaName === areaName) {
        const derivedChanges = this.deriveChanges(changes)
        if (derivedChanges) {
          void callback(derivedChanges)
        }
      }
    }

    browser.storage.onChanged.addListener(handler)

    return () => browser.storage.onChanged.removeListener(handler)
  }

  /**
   * @internal for migration purposes only
   */
  public async getStoredKeys(): Promise<string[]> {
    const items = await this.storageImplementation.get(null)
    return Object.keys(items)
      .filter((key) => key.startsWith(this.namespace))
      .map((key) => key.replace(this.namespace + ":", ""))
  }
}
