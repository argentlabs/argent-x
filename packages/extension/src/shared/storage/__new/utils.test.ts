import { describe, expect, it } from "vitest"
import mockStorageData from "./__test__/__fixtures__/storage.json"

import { containsValue, replaceValueRecursively } from "./utils"

describe("replaceValueRecursively", () => {
  it("should replace the old value with the new value in an object", () => {
    const obj = {
      key1: "value1",
      key2: "value2",
      nested: {
        key3: "value1",
        key4: "value3",
      },
    }
    const expected = {
      key1: "newValue",
      key2: "value2",
      nested: {
        key3: "newValue",
        key4: "value3",
      },
    }

    replaceValueRecursively(obj, "value1", "newValue")

    expect(obj).toEqual(expected)
  })

  it("should replace the old value with the new value in an array", () => {
    const arr = ["value1", "value2", "value1"]
    const expected = ["newValue", "value2", "newValue"]

    replaceValueRecursively(arr, "value1", "newValue")

    expect(arr).toEqual(expected)
  })

  it("should replace the old value with the new value in a nested array", () => {
    const obj = {
      key1: ["value1", "value2", { key2: "value1" }],
    }
    const expected = {
      key1: ["newValue", "value2", { key2: "newValue" }],
    }

    replaceValueRecursively(obj, "value1", "newValue")

    expect(obj).toEqual(expected)
  })

  it("should not modify the object if the old value is not found", () => {
    const obj = {
      key1: "value1",
      key2: "value2",
      nested: {
        key3: "value1",
        key4: "value3",
      },
    }
    const expected = { ...obj }

    replaceValueRecursively(obj, "nonExistentValue", "newValue")

    expect(obj).toEqual(expected)
  })

  it("should handle null and undefined values correctly", () => {
    const obj = {
      key1: null,
      key2: undefined,
      key3: "value1",
    }
    const expected = {
      key1: null,
      key2: undefined,
      key3: "newValue",
    }

    replaceValueRecursively(obj, "value1", "newValue")

    expect(obj).toEqual(expected)
  })

  it("should replace the id of the account in storage", () => {
    const id = mockStorageData["core:accounts:inner"][0].id
    const newId = "newAccountId::sepolia-alpha::local_secret::0"
    const storageDataCopy = JSON.parse(JSON.stringify(mockStorageData))

    replaceValueRecursively(storageDataCopy, id, newId, ["id"])

    expect(storageDataCopy).not.toEqual(mockStorageData)

    // verifies that the old id is replaced with the new id by comparing the stringified versions
    const storageDataCopyAsString = JSON.stringify(storageDataCopy)
    expect(storageDataCopyAsString).toContain(newId)
    expect(storageDataCopyAsString).not.toContain(id)

    const idMatchesInObject = JSON.stringify(mockStorageData).match(
      new RegExp(id, "g"),
    )
    const idCount = idMatchesInObject ? idMatchesInObject.length : 0

    const newIdMatchesInObject = storageDataCopyAsString.match(
      new RegExp(newId, "g"),
    )
    const newIdCount = newIdMatchesInObject ? newIdMatchesInObject.length : 0

    expect(idCount).toBe(newIdCount)

    // verifies that the old id is replaced with the new id by comparing the object versions
    const storageDataCopyAsObject = JSON.parse(storageDataCopyAsString)
    expect(storageDataCopyAsObject).toEqual(storageDataCopy)
    expect(storageDataCopyAsObject).not.toEqual(mockStorageData)

    expect(containsValue(storageDataCopy, id)).toBe(false)
    expect(containsValue(storageDataCopy, newId)).toBe(true)
  })
})
