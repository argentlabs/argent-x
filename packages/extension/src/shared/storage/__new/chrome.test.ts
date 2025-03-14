import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { ChromeRepository } from "./chrome"
import { MockStorage } from "../__test__/chrome-storage.mock"
import type browser from "webextension-polyfill"

interface StoredValue {
  value: string
  [key: string]: any
}

interface TestData {
  defaultKey?: string
  key1?: StoredValue
  key2?: StoredValue
  oldKey?: StoredValue
  newKey?: StoredValue
  testKey?: StoredValue
  [key: string]: any
}

const DEFAULT_DATA: TestData[] = [{ defaultKey: "default" }]

describe("ChromeRepository", () => {
  let mockStorage: MockStorage
  let mockBrowser: typeof browser
  let repository: ChromeRepository<TestData>

  beforeEach(() => {
    mockStorage = new MockStorage("local")

    mockBrowser = {
      storage: {
        local: mockStorage,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sync: new MockStorage("sync"),
        managed: new MockStorage("managed"),
        session: new MockStorage("session"),
        onChanged: mockStorage.onChanged,
      },
    }
    repository = new ChromeRepository<TestData>(mockBrowser.storage, {
      namespace: "test",
      areaName: "local",
      defaults: DEFAULT_DATA,
      compare: (a, b) => a.value === b.value,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Operations", () => {
    it("should get default value when no data exists", async () => {
      const values = await repository.get()
      expect(values).toEqual(DEFAULT_DATA)
    })

    it("should return empty array when storage has empty array", async () => {
      await mockStorage.set({
        "repository:test": [],
      })
      const values = await repository.get()
      expect(values).toEqual([])
    })

    it("should set and get values", async () => {
      const testData = [{ value: "value1" }, { value: "value2" }]
      await repository.upsert(testData)
      const values = await repository.get()
      expect(values).toEqual([...DEFAULT_DATA, ...testData])
    })

    it("should remove values", async () => {
      const testData = [{ value: "value1" }, { value: "value2" }]
      await repository.upsert(testData)
      await repository.remove({ value: "value1" })
      const values = await repository.get()
      expect(values).toEqual([...DEFAULT_DATA, { value: "value2" }])
    })

    it("should handle selector-based get", async () => {
      const testData = [{ value: "value1" }, { value: "value2" }]
      await repository.upsert(testData)
      const values = await repository.get((item) => item.value === "value1")
      expect(values).toEqual([{ value: "value1" }])
    })
  })

  describe("Migrations", () => {
    it("should run migrations in order", async () => {
      // Setup initial data at version 1
      const initialData = [{ value: "test", initialField: true }]
      await mockStorage.set({
        "repository:migration-test": initialData,
      })

      // Create repository with migrations to v3
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 3,
          migrations: {
            2: (data: TestData[]) => {
              return data.map((item) => ({
                ...item,
                v2Added: true,
              }))
            },
            3: (data: TestData[]) => {
              return data.map((item) => ({
                ...item,
                v3Added: true,
              }))
            },
          },
        },
      )

      // Trigger migration by accessing data
      const values = await migrationRepo.get()

      // Verify migrations ran in order
      expect(values).toEqual([
        {
          value: "test",
          initialField: true,
          v2Added: true,
          v3Added: true,
        },
      ])

      // Verify final version in meta
      const meta = await migrationRepo["getMeta"]()
      expect(meta.version).toBe(3)
    })

    it("should store version in meta", async () => {
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 2,
          migrations: {
            2: (data: TestData[]) =>
              data.map((item: TestData) => ({ ...item, migrated: true })),
          },
        },
      )

      await migrationRepo.upsert([{ value: "test" }])

      const meta = await migrationRepo["getMeta"]()
      expect(meta.version).toBe(2)
    })

    it("should not run migrations if version matches", async () => {
      const migration = vi.fn()
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 2,
          migrations: {
            2: migration,
          },
        },
      )

      // Set initial version
      await migrationRepo["setMeta"]({ version: 2 })
      await migrationRepo.upsert([{ value: "test" }])

      expect(migration).not.toHaveBeenCalled()
    })

    it("should throw on version downgrade", async () => {
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 2,
          migrations: {},
        },
      )

      await migrationRepo["setMeta"]({ version: 3 })
      await expect(migrationRepo.get()).rejects.toThrow(
        /Version downgrade detected/,
      )
    })
  })

  describe("Change Subscription", () => {
    it("should notify subscribers when data changes", async () => {
      const callback = vi.fn()
      repository.subscribe(callback)

      const testData = [{ value: "value1" }]
      await repository.upsert(testData)

      expect(callback).toHaveBeenCalledWith({
        newValue: [...DEFAULT_DATA, ...testData],
        oldValue: undefined,
      })
    })

    it("should notify subscribers when migrations update values", async () => {
      // Setup initial data at version 1
      const initialData = [{ value: "test", initialField: true }]
      await mockStorage.set({
        "repository:migration-test": initialData,
      })

      const callback = vi.fn()

      // Create repository and set up subscription before migrations run
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 3,
          migrations: {
            2: (data: TestData[]) => {
              return data.map((item) => ({
                ...item,
                v2Added: true,
              }))
            },
            3: (data: TestData[]) => {
              return data.map((item) => ({
                ...item,
                v3Added: true,
              }))
            },
          },
        },
      )

      // Subscribe before triggering migrations
      migrationRepo.subscribe(callback)

      // Trigger migrations by accessing data
      await migrationRepo.get()

      // Wait for all async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Verify callback was called with migrated data
      const expectedValue = [
        {
          value: "test",
          initialField: true,
          v2Added: true,
          v3Added: true,
        },
      ]

      expect(callback).toHaveBeenCalledWith({
        newValue: expectedValue,
        oldValue: initialData,
      })
    })

    it("should unsubscribe correctly", async () => {
      const callback = vi.fn()
      const unsubscribe = repository.subscribe(callback)

      unsubscribe()
      await repository.upsert([{ value: "value1" }])

      // Wait for any potential async callbacks
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe("Error Handling", () => {
    it("should handle migration errors", async () => {
      const migrationRepo = new ChromeRepository<TestData>(
        mockBrowser.storage,
        {
          namespace: "migration-test",
          areaName: "local",
          defaults: [],
          version: 2,
          migrations: {
            2: () => {
              throw new Error("Migration failed")
            },
          },
        },
      )

      await expect(migrationRepo.upsert([{ value: "test" }])).rejects.toThrow(
        /v2 migration failed for "repository:migration-test"/,
      )
    })
  })
})
