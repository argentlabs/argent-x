import { describe, expect } from "vitest"
import { ensureArray } from "./arrays"

describe("arrays", () => {
  describe("ensureArray", () => {
    it("should return an empty array, given undefined", () => {
      const result = ensureArray(undefined)
      expect(result).toEqual([])
    })

    it("should return the input array as is, given a valid array", () => {
      const inputArray = [1, 2, 3]
      const result = ensureArray(inputArray)
      expect(result).toEqual(inputArray)
    })

    it("should wrap a non-array value in an array, given a non-array value", () => {
      const nonArrayValue = "Not an array"
      const result = ensureArray(nonArrayValue)
      expect(result).toEqual([nonArrayValue])
    })

    it("should not modify an already wrapped value, given a valid single element array", () => {
      const wrappedValue = [42]
      const result = ensureArray(wrappedValue)
      expect(result).toEqual(wrappedValue)
    })

    it("should return an empty array, given null", () => {
      const nullValue = null
      const result = ensureArray(nullValue)
      expect(result).toEqual([])
    })

    it("should wrap an empty object in an array, given an empty object", () => {
      const emptyObject = {}
      const result = ensureArray(emptyObject)
      expect(result).toEqual([{}])
    })

    it("should wrap false an array, given false", () => {
      const result = ensureArray(false)
      expect(result).toEqual([false])
    })
  })
})
