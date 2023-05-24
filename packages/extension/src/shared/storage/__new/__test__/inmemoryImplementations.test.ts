import { describe, expect, test } from "vitest"

import {
  InMemoryObjectStore,
  InMemoryRepository,
} from "./inmemoryImplementations"

describe("InMemoryObjectStore", () => {
  const store = new InMemoryObjectStore<{
    key: string
  }>({ namespace: "test" })

  test("get method returns default data", async () => {
    const data = await store.get()
    expect(data).toEqual({})
  })

  test("set method updates data", async () => {
    await store.set({ key: "value" })
    const data = await store.get()
    expect(data).toEqual({ key: "value" })
  })

  test("subscribe method listens to changes", async () => {
    let change
    const unsubscribe = store.subscribe((storageChange) => {
      change = storageChange
    })

    await store.set({ key: "newValue" })

    expect(change).toEqual({
      oldValue: { key: "value" },
      newValue: { key: "newValue" },
    })

    unsubscribe()
  })
})

describe("InMemoryRepository", () => {
  const repo = new InMemoryRepository<{
    id: number
    value: string
  }>({
    namespace: "test",
    compare(a, b) {
      return a.id === b.id
    },
  })

  test("get method returns default data", async () => {
    const data = await repo.get()
    expect(data).toEqual([])
  })

  test("upsert method creates and updates items", async () => {
    const upsertResult1 = await repo.upsert({ id: 1, value: "a" })
    expect(upsertResult1).toEqual({ created: 1, updated: 0 })

    const upsertResult2 = await repo.upsert({ id: 1, value: "b" })
    expect(upsertResult2).toEqual({ created: 0, updated: 1 })

    const data = await repo.get()
    expect(data).toEqual([{ id: 1, value: "b" }])
  })

  test("remove method removes items", async () => {
    const removedItems = await repo.remove({ id: 1, value: "b" })
    expect(removedItems).toEqual([{ id: 1, value: "b" }])
  })

  test("subscribe method listens to changes", async () => {
    const data = await repo.get()
    expect(data).toEqual([])

    let change
    const unsubscribe = repo.subscribe((storageChange) => {
      change = storageChange
    })

    await repo.upsert({ id: 2, value: "c" })

    expect(change).toEqual({
      oldValue: [],
      newValue: [{ id: 2, value: "c" }],
    })

    unsubscribe()
  })
})
