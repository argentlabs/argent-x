import { InMemoryKeyValueStore } from "../storage/__new/__test__/inmemoryImplementations"

import { DebounceService, shouldRun } from "./DebounceService"
import { beforeEach, describe, test, expect } from "vitest"

describe("DebounceService", () => {
  let debounceService: DebounceService
  let kv: InMemoryKeyValueStore<{ [key: string]: number }>

  beforeEach(() => {
    kv = new InMemoryKeyValueStore<{ [key: string]: number }>({
      namespace: "test",
    })
    debounceService = new DebounceService(kv)
  })

  test("shouldRun returns true if the task has not been run within the debounce time", () => {
    const lastRun = Date.now() - 5000
    const debounce = 1
    const result = shouldRun(lastRun, debounce)
    expect(result).toBe(true)
  })

  test("shouldRun returns false if the task has been run within the debounce time", () => {
    const lastRun = Date.now()
    const debounce = 1
    const result = shouldRun(lastRun, debounce)
    expect(result).toBe(false)
  })

  test("shouldRun works with seconds and not milliseconds", () => {
    const lastRun = Date.now() - 1001
    const debounce = 1
    const result = shouldRun(lastRun, debounce)
    expect(result).toBe(true)

    const lastRun2 = Date.now() - 999
    const result2 = shouldRun(lastRun2, debounce)
    expect(result2).toBe(false)
  })

  test("debounceService.debounce should debounce the task if the task has not been run within the debounce time", async () => {
    const debounce = 1 // in seconds
    const task = {
      id: "test",
      callback: vi.fn(),
      debounce,
    }
    void debounceService.debounce(task)
    await debounceService.debounce(task)
    expect(task.callback).toHaveBeenCalledTimes(1)
  })
})
