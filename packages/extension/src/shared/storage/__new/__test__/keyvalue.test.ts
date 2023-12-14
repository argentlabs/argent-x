import { MockStorage } from "../../__test__/chrome-storage.mock"
import { KeyValueStorage } from "../../keyvalue"
import { AreaName, StorageArea } from "../../types"
import { IObjectStore } from "../interface"
import { adaptKeyValue } from "../keyvalue"

type TestData = {
  foo: string | null
  bar: number
  baz?: string
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
  'adaptKeyValueStore for area "%s" with manifest v%s',
  (areaName, manifestVersion) => {
    let store: KeyValueStorage<TestData>
    let adaptedStore: IObjectStore<TestData>
    let storageImplementation:
      | StorageArea
      | chrome.storage.StorageArea
      | undefined
    if (manifestVersion === 2) {
      storageImplementation = new MockStorage("session")
    }

    beforeAll(() => {
      store = new KeyValueStorage<TestData>(
        { foo: null, bar: 2 },
        { namespace: "testAdapt", areaName },
        storageImplementation,
      )
      adaptedStore = adaptKeyValue(store)
    })

    it("should get data from the store", async () => {
      const result = await adaptedStore.get()
      expect(result).toEqual({ foo: null, bar: 2 })
    })

    it("should set data to the store", async () => {
      await adaptedStore.set({ foo: "baz", bar: 3 })
      const barResult = await store.get("bar")
      const fooResult = await store.get("foo")
      expect(barResult).toEqual(3)
      expect(fooResult).toEqual("baz")
    })

    it("allows data to be set to null", async () => {
      await adaptedStore.set({ foo: null, bar: 3 })
      const barResult = await store.get("bar")
      const fooResult = await store.get("foo")

      expect(barResult).toEqual(3)
      expect(fooResult).toEqual(null)
    })

    it("should subscribe to the store", async () => {
      const callback = vi.fn()
      adaptedStore.subscribe(callback)

      await adaptedStore.set({ foo: "bar" })

      expect(callback).toHaveBeenCalledWith({ foo: "bar", bar: 3 })
    })

    it("should batch multiple changes into one callback", async () => {
      const callback = vi.fn()
      adaptedStore.subscribe(callback)

      void adaptedStore.set({ foo: "foo", bar: 1 })
      void adaptedStore.set({ foo: "bar" })
      await adaptedStore.set({ foo: "baz", bar: 4 })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ foo: "baz", bar: 4 })
    })

    it("should subscribe to the store with initially undefined value", async () => {
      const callback = vi.fn()
      adaptedStore.subscribe(callback)

      await adaptedStore.set({ baz: "foo" })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ foo: "baz", bar: 4, baz: "foo" })
    })
  },
)
