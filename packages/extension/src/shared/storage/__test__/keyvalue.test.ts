import { IKeyValueStorage, KeyValueStorage } from "../keyvalue"

describe("full storage flow", () => {
  let store: IKeyValueStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new KeyValueStorage<{ foo: string }>(
      { foo: "bar" },
      { namespace: "test", areaName: "local" },
    )
  })
  test("throw when storage area is invalid", () => {
    expect(() => {
      store = new KeyValueStorage<{ foo: string }>(
        { foo: "bar" },
        { namespace: "test", areaName: "invalid" as any },
      )
    }).toThrowErrorMatchingInlineSnapshot('"Unknown storage area: invalid"')
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
})

describe("full storage flow with subscription", () => {
  let store: IKeyValueStorage<{
    foo: string
  }>
  beforeAll(() => {
    store = new KeyValueStorage<{ foo: string }>(
      { foo: "bar" },
      { namespace: "test", areaName: "local" },
    )
  })
  test("should write and notify", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    await store.set("foo", "baz")

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith("baz", {
      newValue: "baz",
      oldValue: undefined,
    })
    const value = await store.get("foo")
    expect(value).toBe("baz")
    unsub()
  })
  test("should remove, fallback to default and notify", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    await store.delete("foo")

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith("bar", {
      oldValue: "baz",
      newValue: undefined,
    })
    const value = await store.get("foo")
    expect(value).toBe("bar")
    unsub()
  })
  test("should unsubscribe", async () => {
    const handler = vi.fn()
    const unsub = store.subscribe("foo", handler)
    unsub()
    await store.set("foo", "baz")
    expect(handler).not.toHaveBeenCalled()
  })
})
