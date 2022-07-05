import { IStorage, Storage } from "../general"
import { chromeStorageMock } from "./chrome-storage-mock"

describe("full storage flow", () => {
  let store: IStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new Storage<{ foo: string }>(
      { foo: "bar" },
      { namespace: "test", areaName: "local" },
      chromeStorageMock,
    )
  })
  test("should return defaults", async () => {
    const value = await store.getItem("foo")
    expect(value).toBe("bar")
  })
  test("should write", async () => {
    await store.setItem("foo", "baz")
    const value = await store.getItem("foo")
    expect(value).toBe("baz")
  })
  test("should remove and return default value", async () => {
    await store.removeItem("foo")
    const value = await store.getItem("foo")
    expect(value).toBe("bar") // default
  })
})

describe("full storage flow with subscription", () => {
  let store: IStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new Storage<{ foo: string }>(
      { foo: "bar" },
      { namespace: "test", areaName: "local" },
      chromeStorageMock,
    )
  })
  test("should write and notify", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    await store.setItem("foo", "baz")

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith("baz")
    const value = await store.getItem("foo")
    expect(value).toBe("baz")
    unsub()
  })
  test("should remove and notify", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    await store.removeItem("foo")

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(undefined)
    const value = await store.getItem("foo")
    expect(value).toBe("bar")
    unsub()
  })
  test("should unsubscribe", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    unsub()
    await store.setItem("foo", "baz")
    expect(handler).not.toHaveBeenCalled()
  })
})
