import { isArray, isFunction, partition } from "lodash-es"
import type browser from "webextension-polyfill"

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
import { ensureArray } from "@argent/x-shared"

interface ChromeRepositoryOptions {
  areaName: browser.storage.AreaName
  version?: number
  migrations?: Record<number, (oldValue: any) => any>
}

export class ChromeRepository<T> implements IRepository<T> {
  public readonly namespace: string
  private readonly browserStorage: typeof browser.storage
  private readonly storageArea: (typeof browser.storage)[browser.storage.AreaName]
  private readonly options: Required<IRepositoryOptions<T>> &
    ChromeRepositoryOptions
  private migrationPromise: Promise<void> | null = null

  constructor(
    browserStorage: typeof browser.storage,
    options: IRepositoryOptions<T> & ChromeRepositoryOptions,
  ) {
    this.browserStorage = browserStorage
    this.options = optionsWithDefaults(options)
    this.storageArea = this.browserStorage[this.options.areaName]
    this.namespace = `repository:${this.options.namespace}`
  }

  private getMetaKey = () => `${this.namespace}$meta`

  private async getMeta(): Promise<{ version?: number }> {
    const all = await this.storageArea.get(this.getMetaKey())
    return all[this.getMetaKey()] || {}
  }

  private async setMeta(meta: { version?: number }): Promise<void> {
    await this.storageArea.set({
      [this.getMetaKey()]: meta,
    })
  }

  private async getRawStorage(): Promise<T[]> {
    const all = await this.storageArea.get(this.namespace)
    const values = all[this.namespace]

    // Only return defaults if the key doesn't exist in storage
    if (values === undefined) {
      return this.options.defaults
    }

    const deserialized = this.options.deserialize(values)

    return deserialized
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

    const items = await this.getRawStorage()

    console.debug(
      `[ChromeRepository] Starting migration for ${this.namespace}: v${currentVersion} -> v${targetVersion}`,
      { items },
    )

    const migrationsToRun = Array.from(
      { length: targetVersion - currentVersion },
      (_, i) => currentVersion + i + 1,
    )

    let migratedValue = [...items]
    for (const migrateToVersion of migrationsToRun) {
      try {
        const migrationFn = this.options.migrations?.[migrateToVersion]
        if (migrationFn) {
          console.debug(
            `[ChromeRepository] Running migration v${migrateToVersion} for ${this.namespace}`,
            {
              before: migratedValue,
            },
          )

          const result = await migrationFn(migratedValue)
          migratedValue = ensureArray(result).map((item) => ({ ...item }))

          console.debug(
            `[ChromeRepository] Completed migration v${migrateToVersion} for ${this.namespace}`,
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

    // First update the version in meta
    await this.setMeta({ version: targetVersion })

    // Then save the migrated data
    await this.setRawStorage(migratedValue)

    console.debug(
      `[ChromeRepository] Migration completed for ${this.namespace} v${targetVersion}`,
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

  private async setRawStorage(value: T[]): Promise<void> {
    const serialized = await this.options.serialize(value)

    return this.storageArea.set({
      [this.namespace]: serialized,
    })
  }

  private getStorage = async (): Promise<T[]> => {
    await this.ensureMigrated()
    return this.getRawStorage()
  }

  async get(selector?: (value: T) => boolean): Promise<T[]> {
    const items = await this.getStorage()
    if (selector) {
      return items.filter(selector)
    }

    return items
  }

  private async set(value: T[]): Promise<void> {
    await this.ensureMigrated()
    return this.setRawStorage(value)
  }

  async remove(value: SelectorFn<T> | AllowArray<T>): Promise<T[]> {
    await this.ensureMigrated()
    const items = await this.getStorage()

    const compareFn = this.options.compare.bind(this)

    const selector = isFunction(value)
      ? (item: T) => !value(item)
      : isArray(value)
        ? (item: T) => !value.some((v) => compareFn(v, item))
        : (item: T) => !compareFn(value, item)

    const [keptValues, removedValues] = partition(items, selector)

    await this.set(keptValues)
    return removedValues
  }

  async upsert(
    value: AllowArray<T> | SetterFn<T>,
    insertMode: "push" | "unshift" = "push",
  ): Promise<UpsertResult> {
    await this.ensureMigrated()
    const items = await this.getStorage()

    let newValues: T[]
    if (isFunction(value)) {
      newValues = value(items)
    } else if (Array.isArray(value)) {
      newValues = value
    } else {
      newValues = [value]
    }
    const mergedValues = mergeArrayStableWith(items, newValues, {
      compareFn: this.options.compare.bind(this),
      mergeFn: this.options.merge.bind(this),
      insertMode,
    })

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
      areaName?: chrome.storage.AreaName,
    ) => {
      // For mock storage, use the instance's areaName if not provided
      if (areaName !== undefined && areaName !== this.options.areaName) {
        return
      }

      const changeSet = changes[this.namespace]

      if (!changeSet) {
        return
      }

      const asyncCb = async () => {
        await this.ensureMigrated()
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

    this.browserStorage.onChanged.addListener(onChange)

    return () => {
      this.browserStorage.onChanged.removeListener(onChange)
    }
  }
}
