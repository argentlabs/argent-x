import { IObjectStore } from "../interface"
import { adaptObjectStorage } from "../object"
import { ObjectStorage } from "../../object"

type TestData = {
  foo: string | null
} | null

describe("adaptObjectStorage", () => {
  let store: ObjectStorage<TestData>
  let adaptedStore: IObjectStore<TestData>

  beforeAll(() => {
    store = new ObjectStorage<TestData>(null, {
      namespace: "testAdapt",
      areaName: "local",
    })
    adaptedStore = adaptObjectStorage(store)
  })

  it("should get data from the store", async () => {
    const result = await adaptedStore.get()
    expect(result).toEqual(null)
  })

  it("should set data to the store", async () => {
    await adaptedStore.set({ foo: "bar" })
    const fooResult = await store.get()
    expect(fooResult).toEqual({ foo: "bar" })
  })

  it("allows data to be set to null", async () => {
    await adaptedStore.set({ foo: "123" })
    const fooResult = await store.get()
    expect(fooResult).toEqual({ foo: "123" })
  })

  /* 
  // enable this test when inmemoryimplementation and object storage subscription is fixed
  it("should subscribe to the store", async () => {
    const callback = vi.fn()
    adaptedStore.subscribe(callback)

    await adaptedStore.set({ foo: "xyz" })

    expect(callback).toHaveBeenCalledWith({
      newValue: {
        foo: "xyz",
      },
      oldValue: { foo: "123" },
    })
  }) */
})
