import { describe, beforeEach, expect } from "vitest"
import { UniqueSet } from "./uniqueSet"

// Define a simple object structure for testing
type TestObject = {
  id: string
  name: string
}

describe("UniqueSet", () => {
  let uniqueSet: UniqueSet<TestObject, string>

  beforeEach(() => {
    // Initialize the UniqueSet with a function to get the identifier
    uniqueSet = new UniqueSet<TestObject, string>((a: TestObject) => a.id)
  })

  test("add() and has()", async () => {
    const item: TestObject = { id: "1", name: "test" }
    uniqueSet.add(item)

    expect(uniqueSet.has("1")).toBe(true)
    expect(uniqueSet.has("2")).toBe(false)
  })

  test("get()", async () => {
    const item: TestObject = { id: "1", name: "test" }
    uniqueSet.add(item)

    expect(uniqueSet.get("1")).toBe(item)
    expect(uniqueSet.get("2")).toBe(undefined)
  })

  test("getAll()", async () => {
    const item1: TestObject = { id: "1", name: "test1" }
    const item2: TestObject = { id: "2", name: "test2" }
    uniqueSet.add(item1)
    uniqueSet.add(item2)

    const values = uniqueSet.getAll()

    expect(values.length).toBe(2)
    expect(values.includes(item1)).toBe(true)
    expect(values.includes(item2)).toBe(true)
  })

  test("delete()", async () => {
    const item: TestObject = { id: "1", name: "test" }
    uniqueSet.add(item)

    expect(uniqueSet.delete("1")).toBe(true)
    expect(uniqueSet.delete("2")).toBe(false)
    expect(uniqueSet.has("1")).toBe(false)
    expect(uniqueSet.has("2")).toBe(false)
  })

  test("add() updates existing items", async () => {
    const item1: TestObject = { id: "1", name: "test1" }
    const item2: TestObject = { id: "1", name: "test2" } // same id, different name
    uniqueSet.add(item1)
    uniqueSet.add(item2)

    const retrievedItem = uniqueSet.get("1")

    expect(retrievedItem).toBe(item2)
  })
})
