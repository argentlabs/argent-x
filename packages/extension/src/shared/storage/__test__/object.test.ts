import type { IObjectStorage } from "../types/IObjectStorage"
import { ObjectStorage } from "../object"

describe("full storage flow with object", () => {
  const defaults = { foo: "bar" }
  let store: IObjectStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new ObjectStorage<{ foo: string }>(defaults, "test")
  })
  test("should return defaults", async () => {
    const value = await store.get()
    expect(value).toEqual(defaults)
  })
  test("should write", async () => {
    await store.set({ foo: "baz" })
    const value = await store.get()
    expect(value).toEqual({ foo: "baz" })
  })
})

describe("full storage flow with object and parsing", () => {
  const defaults = { foo: "bar" }
  let store: ObjectStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new ObjectStorage<{ foo: string }>(defaults, {
      namespace: "test2",
      serialize(value) {
        return JSON.stringify(value)
      },
      deserialize(value) {
        return JSON.parse(value)
      },
    })
  })
  test("should return defaults", async () => {
    const value = await store.get()
    expect(value).toEqual(defaults)
  })
  test("should write", async () => {
    await store.set({ foo: "baz" })
    const value = await store.get()
    expect(value).toEqual({ foo: "baz" })
  })
  test("should write using selector", async () => {
    await store.set((value) => ({ ...value, baz: "foo" }))
    const value = await store.get()
    expect(value).toEqual({ foo: "baz", baz: "foo" })
  })
})

describe("full storage flow with string and subscription", () => {
  let store: ObjectStorage<string>
  beforeAll(() => {
    store = new ObjectStorage<string>("bar", { namespace: "test3" })
  })
  test("should write and notify", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe(handler)
    await store.set("baz")

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith("baz", {
      newValue: "baz",
      oldValue: "bar",
    })
    const value = await store.get()
    expect(value).toBe("baz")
    unsub()
  })
  test("should unsubscribe", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe(handler)
    unsub()
    await store.set("baz")
    expect(handler).not.toHaveBeenCalled()
  })
})
