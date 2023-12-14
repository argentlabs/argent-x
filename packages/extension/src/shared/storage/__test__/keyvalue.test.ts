import { describe, expect, test, vi } from "vitest"

import { IKeyValueStorage, KeyValueStorage } from "../keyvalue"
import { AreaName, StorageArea } from "../types"
import { MockStorage } from "./chrome-storage.mock"

interface IStore {
  foo: string
}

type TestDataType = [AreaName, 2 | 3]

describe.each<TestDataType>([
  ["local", 2],
  ["local", 3],
  ["managed", 2],
  ["managed", 3],
  ["session", 2],
  ["session", 3],
])(
  'Full storage flow for area "%s" with manifest v%s',
  (areaName, manifestVersion) => {
    let store: IKeyValueStorage<IStore>
    let storageImplementation:
      | StorageArea
      | chrome.storage.StorageArea
      | undefined
    if (manifestVersion === 2) {
      storageImplementation = new MockStorage("session")
    }
    beforeAll(() => {
      store = new KeyValueStorage<IStore>(
        { foo: "bar" },
        { namespace: "test", areaName },
        storageImplementation,
      )
    })
    test(`should have a valid storage type: ${areaName}`, () => {
      expect(typeof areaName).toBe("string")
    })
    test("should return defaults", async () => {
      const value = await store.get("foo")
      expect(value).toBe("bar")
    })
    test("should write", async () => {
      await store.set("foo", "baz")
      const value = await store.get("foo")
      expect(value).toBe("baz")
    })
    test("should remove and return default value", async () => {
      await store.delete("foo")
      const value = await store.get("foo")
      expect(value).toBe("bar") // default
    })
  },
)

describe.each<TestDataType>([
  ["local", 2],
  ["local", 3],
  ["managed", 2],
  ["managed", 3],
  ["session", 2],
  ["session", 3],
])(
  'Full storage flow for area "%s" with manifest v%s with subscription',
  (areaName, manifestVersion) => {
    let storageImplementation:
      | StorageArea
      | chrome.storage.StorageArea
      | undefined
    if (manifestVersion === 2) {
      storageImplementation = new MockStorage("session")
    }
    let store: IKeyValueStorage<IStore>
    beforeAll(() => {
      store = new KeyValueStorage<IStore>(
        { foo: "bar" },
        { namespace: "test", areaName },
        storageImplementation,
      )
    })
    test("should write and notify", async () => {
      const handler = vi.fn()
      const allHandler = vi.fn()
      const unsub = store.subscribe("foo", handler)
      const unsubAll = store.subscribe(allHandler)
      await store.set("foo", "baz")

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith("baz", {
        newValue: "baz",
        oldValue: undefined,
      })

      expect(allHandler).toHaveBeenCalledTimes(1)
      expect(allHandler).toHaveBeenCalledWith({
        newValue: {
          foo: "baz",
        },
        oldValue: {},
      })

      const value = await store.get("foo")
      expect(value).toBe("baz")
      unsub()
      unsubAll()
    })
    test("should remove, fallback to default and notify", async () => {
      const handler = vi.fn()
      const allHandler = vi.fn()
      const unsub = store.subscribe("foo", handler)
      const unsubAll = store.subscribe(allHandler)
      await store.delete("foo")

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith("bar", {
        oldValue: "baz",
        newValue: undefined,
      })

      expect(allHandler).toHaveBeenCalledTimes(1)
      expect(allHandler).toHaveBeenCalledWith({
        newValue: {},
        oldValue: {
          foo: "baz",
        },
      })

      const value = await store.get("foo")
      expect(value).toBe("bar")
      unsub()
      unsubAll()
    })
    test("should unsubscribe", async () => {
      const handler = vi.fn()
      const allHandler = vi.fn()
      const unsub = store.subscribe("foo", handler)
      const unsubAll = store.subscribe(allHandler)
      unsub()
      unsubAll()
      await store.set("foo", "baz")
      expect(handler).not.toHaveBeenCalled()
      expect(allHandler).not.toHaveBeenCalled()
    })
  },
)

describe("when invalid", () => {
  test("throw when storage area is invalid", () => {
    expect(() => {
      new KeyValueStorage<IStore>(
        { foo: "bar" },
        { namespace: "test", areaName: "invalid" as any },
      )
    }).toThrowErrorMatchingInlineSnapshot('"Unknown storage area: invalid"')
  })
})
