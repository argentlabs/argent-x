import { describe, expect, test } from "vitest"

import { isAllowedNumericInputValue } from "../src/ui/components/InputText"

describe("isAllowedNumericInputValue()", () => {
  describe("when valid", () => {
    test("should return true", () => {
      expect(isAllowedNumericInputValue("")).toBeTruthy()
      expect(isAllowedNumericInputValue("1")).toBeTruthy()
      expect(isAllowedNumericInputValue("1.")).toBeTruthy()
      expect(isAllowedNumericInputValue("1.1")).toBeTruthy()
      expect(isAllowedNumericInputValue("123.123")).toBeTruthy()
      expect(isAllowedNumericInputValue("123.1234567890123456")).toBeTruthy()
      expect(isAllowedNumericInputValue("123.123", 3)).toBeTruthy()
    })
  })
  describe("when invalid", () => {
    test("should return false", () => {
      expect(isAllowedNumericInputValue("x")).toBeFalsy()
      expect(isAllowedNumericInputValue("1x")).toBeFalsy()
      expect(isAllowedNumericInputValue("1.1.")).toBeFalsy()
      expect(isAllowedNumericInputValue("foo")).toBeFalsy()
      expect(isAllowedNumericInputValue("123.12345678901234567")).toBeFalsy()
      expect(isAllowedNumericInputValue("123.1234", 3)).toBeFalsy()
    })
  })
})
