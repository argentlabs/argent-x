import { KeyValueStorage } from "../../keyvalue"
import { IObjectStore } from "../interface"
import { adaptKeyValue } from "../keyvalue"

type TestData = {
  foo: string | null
  bar: number
}

describe("adaptKeyValueStore", () => {
  let store: KeyValueStorage<TestData>
  let adaptedStore: IObjectStore<TestData>

  beforeAll(() => {
    store = new KeyValueStorage<TestData>(
      { foo: null, bar: 2 },
      { namespace: "testAdapt", areaName: "local" },
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

    await adaptedStore.set({ foo: "baz", bar: 4 })

    expect(callback).toHaveBeenCalledWith({ foo: "baz", bar: 4 })
  })
})
