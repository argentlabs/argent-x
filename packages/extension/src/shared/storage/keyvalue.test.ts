import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { KeyValueStorage } from "./keyvalue"
import { MockStorage } from "./__test__/chrome-storage.mock"

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

interface TestMeta {
  version?: number
  key1?: string
  key2?: string
  custom?: string
}

const DEFAULT_DATA: TestData = {
  defaultKey: "default",
}

describe("KeyValueStorage", () => {
  let mockStorage: MockStorage
  let storage: KeyValueStorage<TestData>

  beforeEach(() => {
    mockStorage = new MockStorage("local")
    storage = new KeyValueStorage<TestData>(
      DEFAULT_DATA,
      { namespace: "test", areaName: "local" },
      mockStorage,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Operations", () => {
    it("should get default value when key doesn't exist", async () => {
      const value = await storage.get("defaultKey")
      expect(value).toBe("default")
    })

    it("should set and get a value", async () => {
      await storage.set("key1", { value: "value1" })
      const value = await storage.get("key1")
      expect(value).toEqual({ value: "value1" })
    })

    it("should delete a value", async () => {
      await storage.set("key1", { value: "value1" })
      await storage.delete("key1")
      const value = await storage.get("key1")
      expect(value).toBeUndefined()
    })

    it("should handle non-existent keys", async () => {
      const value = await storage.get("key1")
      expect(value).toBeUndefined()
    })
  })

  describe("Migrations", () => {
    it("should run migrations in order", async () => {
      // Setup initial data at version 1
      const initialData = { value: "test", initialField: true }
      await mockStorage.set({
        "migration-test:testKey": initialData,
      })
      await mockStorage.set({
        "migration-test:testKey2": initialData,
      })

      // Create storage with migrations to v3
      const migrationStorage = new KeyValueStorage<TestData>(
        {},
        {
          namespace: "migration-test",
          areaName: "local",
          version: 3,
          migrations: {
            2: (data: TestData) => {
              const updatedData = {}
              for (const [key, rawData] of Object.entries(data)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                updatedData[key] = {
                  ...rawData,
                  v2Added: true,
                }
              }
              return updatedData
            },
            3: (data: TestData) => {
              const updatedData = {}
              for (const [key, rawData] of Object.entries(data)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                updatedData[key] = {
                  ...rawData,
                  v3Added: true,
                }
              }
              return updatedData
            },
          },
        },
        mockStorage,
      )

      // Trigger migration by accessing data
      const testKeyValue = await migrationStorage.get("testKey")
      const testKey2Value = await migrationStorage.get("testKey2")

      // Verify migrations ran in order
      expect(testKeyValue).toEqual({
        value: "test",
        initialField: true,
        v2Added: true,
        v3Added: true,
      })

      expect(testKey2Value).toEqual({
        value: "test",
        initialField: true,
        v2Added: true,
        v3Added: true,
      })

      // Verify final version in meta
      const meta = await migrationStorage["getMeta"]()
      expect(meta.version).toBe(3)
    })

    it("should store version in meta", async () => {
      const migrationStorage = new KeyValueStorage<TestData>(
        DEFAULT_DATA,
        {
          namespace: "migration-test",
          areaName: "local",
          version: 2,
          migrations: {
            2: (data) => ({ ...data, migrated: true }),
          },
        },
        mockStorage,
      )

      await migrationStorage.set("testKey", { value: "test" })

      const meta = await migrationStorage["getMeta"]()
      expect(meta.version).toBe(2)
    })

    it("should not run migrations if version matches", async () => {
      const migration = vi.fn()
      const migrationStorage = new KeyValueStorage<TestData>(
        DEFAULT_DATA,
        {
          namespace: "migration-test",
          areaName: "local",
          version: 2,
          migrations: {
            2: migration,
          },
        },
        mockStorage,
      )

      // Set initial version
      await migrationStorage["setMeta"]({ version: 2 } as TestMeta)
      await migrationStorage.set("testKey", { value: "test" })

      expect(migration).not.toHaveBeenCalled()
    })

    it("should throw on version downgrade", async () => {
      // Set higher version in meta
      const migrationStorage = new KeyValueStorage<TestData>(
        DEFAULT_DATA,
        {
          namespace: "migration-test",
          areaName: "local",
          version: 2,
          migrations: {},
        },
        mockStorage,
      )

      await migrationStorage["setMeta"]({ version: 3 } as TestMeta)
      await expect(migrationStorage.get("testKey")).rejects.toThrow(
        /Version downgrade detected/,
      )
    })
  })

  describe("Namespace Handling", () => {
    it("should properly namespace keys", async () => {
      await storage.set("key1", { value: "value1" })
      const rawValue = await mockStorage.get("test:key1")
      expect(rawValue["test:key1"].value).toBe("value1")
    })

    it("should not conflict with other namespaces", async () => {
      const storage2 = new KeyValueStorage<TestData>(
        DEFAULT_DATA,
        { namespace: "test2", areaName: "local" },
        mockStorage,
      )

      await storage.set("key1", { value: "value1" })
      await storage2.set("key1", { value: "value2" })

      const value1 = await storage.get("key1")
      const value2 = await storage2.get("key1")

      expect(value1?.value).toBe("value1")
      expect(value2?.value).toBe("value2")
    })
  })

  describe("Change Subscription", () => {
    it("should notify on value changes", async () => {
      const callback = vi.fn()
      storage.subscribe("key1", callback)

      await storage.set("key1", { value: "value1" })

      expect(callback).toHaveBeenCalledWith(
        { value: "value1" },
        expect.any(Object),
      )
    })

    it("should notify on deletions", async () => {
      const callback = vi.fn()
      await storage.set("key1", { value: "value1" })
      storage.subscribe("key1", callback)

      await storage.delete("key1")

      expect(callback).toHaveBeenCalledWith(undefined, {
        newValue: undefined,
        oldValue: { value: "value1" },
      })
    })

    it("should unsubscribe correctly", async () => {
      const callback = vi.fn()
      const unsubscribe = storage.subscribe("key1", callback)

      unsubscribe()
      await storage.set("key1", { value: "value1" })

      expect(callback).not.toHaveBeenCalled()
    })

    it("should notify all subscribers", async () => {
      const callback = vi.fn()
      storage.subscribe(callback)

      await storage.set("key1", { value: "value1" })
      await storage.set("key2", { value: "value2" })

      expect(callback).toHaveBeenCalledTimes(2)
    })

    it("should notify subscribers when migrations update values", async () => {
      // Setup initial data at version 1
      const initialData = { value: "test", initialField: true }
      await mockStorage.set({
        "migration-test:testKey": initialData,
        "migration-test:testKey2": initialData,
      })

      const callback1 = vi.fn()
      const callback2 = vi.fn()

      // Create storage and set up subscriptions before migrations run
      const migrationStorage = new KeyValueStorage<TestData>(
        {},
        {
          namespace: "migration-test",
          areaName: "local",
          version: 3,
          migrations: {
            2: (data: TestData) => {
              const updatedData: Record<string, any> = {}
              for (const [key, rawData] of Object.entries(data)) {
                updatedData[key] = {
                  ...rawData,
                  v2Added: true,
                }
              }
              return updatedData as TestData
            },
            3: (data: TestData) => {
              const updatedData: Record<string, any> = {}
              for (const [key, rawData] of Object.entries(data)) {
                updatedData[key] = {
                  ...rawData,
                  v3Added: true,
                }
              }
              return updatedData as TestData
            },
          },
        },
        mockStorage,
      )

      // Subscribe to both keys before triggering migrations
      migrationStorage.subscribe("testKey", callback1)
      migrationStorage.subscribe("testKey2", callback2)

      // Trigger migrations by accessing data
      await migrationStorage.get("testKey")
      await migrationStorage.get("testKey2")

      // Verify callbacks were called with migrated data
      const expectedValue = {
        value: "test",
        initialField: true,
        v2Added: true,
        v3Added: true,
      }

      expect(callback1).toHaveBeenCalledWith(expectedValue, {
        newValue: expectedValue,
        oldValue: {
          initialField: true,
          value: "test",
        },
      })
      expect(callback2).toHaveBeenCalledWith(expectedValue, {
        newValue: expectedValue,
        oldValue: {
          initialField: true,
          value: "test",
        },
      })
    })
  })

  describe("Error Handling", () => {
    it("should handle migration errors", async () => {
      const migrationStorage = new KeyValueStorage<TestData>(
        DEFAULT_DATA,
        {
          namespace: "migration-test",
          areaName: "local",
          version: 2,
          migrations: {
            2: () => {
              throw new Error("Migration failed")
            },
          },
        },
        mockStorage,
      )

      await expect(
        migrationStorage.set("testKey", { value: "test" }),
      ).rejects.toThrow(/v2 migration failed for "migration-test"/)
    })
  })
})
