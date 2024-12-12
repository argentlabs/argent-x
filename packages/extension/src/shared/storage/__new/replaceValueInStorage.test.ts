import { beforeEach, describe, expect, it, vi } from "vitest"
import browser from "webextension-polyfill"
import mockStorageData from "./__test__/__fixtures__/storage.json"
import { replaceValueInStorage } from "./replaceValueInStorage"

import * as utils from "./utils"

describe("Replace value in browser storage", () => {
  beforeEach(async () => {
    vi.spyOn(browser.storage.local, "set").mockResolvedValue()
    // mocking the implementation and not the return value because get has 3 overloads and not all return a value, so the compiler complains
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vi.spyOn(browser.storage.local, "get").mockImplementation(() =>
      Promise.resolve(mockStorageData),
    )
  })

  it("should replace id in browser storage", async () => {
    await replaceValueInStorage(
      mockStorageData["core:accounts:inner"][0].id,
      "newValue",
      ["id"],
    )
    expect(browser.storage.local.get).toHaveBeenCalled()
    expect(browser.storage.local.set).not.toHaveBeenCalledWith(mockStorageData)
  })

  it("should not replace because value does not exist", async () => {
    await replaceValueInStorage("oldValue", "newValue")
    expect(browser.storage.local.get).toHaveBeenCalled()
    expect(browser.storage.local.set).toHaveBeenCalledWith(mockStorageData)
  })

  it("should restore the original storage data in case of an error when saving ", async () => {
    const mockData = {
      key1: "oldValue",
      key2: "value2",
      nested: {
        key3: "oldValue",
        key4: "value3",
      },
      array: ["oldValue", "value4"],
    }
    vi.spyOn(browser.storage.local, "set").mockRejectedValueOnce(
      new Error("Set error"),
    )
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vi.spyOn(browser.storage.local, "get").mockImplementation(() =>
      Promise.resolve(mockData),
    )
    await replaceValueInStorage("oldValue", "newValue")

    expect(browser.storage.local.get).toHaveBeenCalled()
    expect(browser.storage.local.set).toHaveBeenCalledTimes(2)
    expect(browser.storage.local.set).toHaveBeenNthCalledWith(1, {
      key1: "newValue",
      key2: "value2",
      nested: {
        key3: "newValue",
        key4: "value3",
      },
      array: ["newValue", "value4"],
    })
    expect(browser.storage.local.set).toHaveBeenNthCalledWith(2, mockData)
  })

  it("should not save the data in case of error when replacing the values", async () => {
    const mockData = {
      key1: "oldValue",
      key2: "value2",
      nested: {
        key3: "oldValue",
        key4: "value3",
      },
      array: ["oldValue", "value4"],
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vi.spyOn(browser.storage.local, "get").mockImplementation(() =>
      Promise.resolve(mockData),
    )
    vi.spyOn(utils, "replaceValueRecursively").mockImplementationOnce(() => {
      throw new Error("Failed to replace value")
    })

    await replaceValueInStorage("oldValue", "newValue")

    expect(browser.storage.local.get).toHaveBeenCalled()
    expect(browser.storage.local.set).not.toHaveBeenCalled()
  })
})
