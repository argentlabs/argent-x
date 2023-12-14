import { describe, expect, test, vi } from "vitest"

import {
  IMinimalStorage,
  Pattern,
  copyObjectToStorage,
  copyStorageToObject,
  pruneStorageData,
  setItemWithStorageQuotaExceededStrategy,
} from "./prune"

const QUOTA_CHARACTERS = 10

const ERROR_STRING = `Quota exceeded - max ${QUOTA_CHARACTERS} characters`

function createStorageMock(): IMinimalStorage {
  return Object.create(
    {},
    {
      getItem: {
        value(key: string) {
          return this[key] ?? null
        },
      },
      setItem: {
        value(key: string, value: any) {
          const snapshot = this[key]
          this[key] = `${value}`
          const bytesUsed = Object.values<string>(this).reduce(
            (acc, currentString) => {
              return acc + currentString.length
            },
            0,
          )
          if (bytesUsed > QUOTA_CHARACTERS) {
            if (snapshot) {
              this[key] = snapshot
            }
            throw new DOMException(ERROR_STRING, "QuotaExceededError")
          }
        },
      },
      removeItem: {
        value(key: string) {
          delete this[key]
        },
      },
    },
  )
}

describe("prune", () => {
  describe("pruneStorageData", () => {
    it("should prune keys matching pattern", async () => {
      const patterns: Pattern[] = [/foo/, /bar/]
      const store = createStorageMock()
      store.setItem("foo", "1")
      store.setItem("bar", "2")
      store.setItem("baz", "3")
      pruneStorageData(store, patterns)
      expect(Object.keys(store)).toEqual(["baz"])
    })
    it("should update values with pruning function", async () => {
      const pruneFn = vi.fn((value) => (value === "2" ? "pruned" : value))
      const patterns: Pattern[] = [[/baz/, pruneFn]]
      const store = createStorageMock()
      store.setItem("foo:baz", "1")
      store.setItem("bar:baz", "2")
      pruneStorageData(store, patterns)
      expect(Object.keys(store)).toEqual(["foo:baz", "bar:baz"])
      expect(pruneFn).toHaveBeenNthCalledWith(1, "1")
      expect(pruneFn).toHaveBeenNthCalledWith(2, "2")
      expect(store.getItem("foo:baz")).toEqual("1")
      expect(store.getItem("bar:baz")).toEqual("pruned")
    })
  })
  describe("copyStorageToObject", () => {
    it("should copy storage to object", async () => {
      const store = createStorageMock()
      store.setItem("foo", "1")
      store.setItem("bar", "2")
      store.setItem("baz", "3")
      const object = copyStorageToObject(store)
      expect(object).toEqual({
        foo: "1",
        bar: "2",
        baz: "3",
      })
      copyObjectToStorage(
        {
          foo: "2",
          bar: "1",
        },
        store,
      )
      expect(store.getItem("foo")).toEqual("2")
      expect(store.getItem("bar")).toEqual("1")
      expect(store.getItem("baz")).toBeNull()
    })
  })
  describe("setItemWithStorageQuotaExceededStrategy", () => {
    it("should prune entries", async () => {
      const patterns: Pattern[] = [/foo/, /bar/]
      const store = createStorageMock()
      setItemWithStorageQuotaExceededStrategy("foo", "01234", store, patterns)
      setItemWithStorageQuotaExceededStrategy("bar", "56789", store, patterns)
      expect(store.getItem("foo")).toEqual("01234")
      expect(store.getItem("bar")).toEqual("56789")
      /** exceed quota - expect prune */
      setItemWithStorageQuotaExceededStrategy("baz", "abcde", store, patterns)
      expect(store.getItem("foo")).toBeNull()
      expect(store.getItem("bar")).toBeNull()
      expect(store.getItem("baz")).toEqual("abcde")
      /** exceed quota - individual item won't fit */
      expect(() =>
        setItemWithStorageQuotaExceededStrategy(
          "baz",
          "0123456789abcde",
          store,
          patterns,
        ),
      ).toThrowError(ERROR_STRING)
      expect(store.getItem("baz")).toEqual("abcde")
    })
  })
})
