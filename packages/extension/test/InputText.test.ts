import { describe, expect, test } from "vitest"

import { isAllowedAddressHexInputValue } from "../src/ui/components/utils/isAllowedAddressHexInputValue"
import { isAllowedNumericInputValue } from "../src/ui/components/utils/isAllowedNumericInputValue"

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

describe("isAllowedAddressHexInputValue()", () => {
  describe("when valid", () => {
    test("should return true", () => {
      expect(isAllowedAddressHexInputValue("")).toBeTruthy()
      expect(isAllowedAddressHexInputValue("0")).toBeTruthy()
      expect(isAllowedAddressHexInputValue("0x")).toBeTruthy()
      expect(isAllowedAddressHexInputValue("0x0")).toBeTruthy()
      expect(isAllowedAddressHexInputValue("0xabc123")).toBeTruthy()
      expect(isAllowedAddressHexInputValue("0xABc123")).toBeTruthy()
    })
  })
  describe("when invalid", () => {
    test("should return false", () => {
      expect(isAllowedAddressHexInputValue("x")).toBeFalsy()
      expect(isAllowedAddressHexInputValue("1x")).toBeFalsy()
      expect(isAllowedAddressHexInputValue("0X")).toBeFalsy()
      expect(isAllowedAddressHexInputValue("0x0x")).toBeFalsy()
      expect(isAllowedAddressHexInputValue("0x0x123")).toBeFalsy()
      expect(isAllowedAddressHexInputValue("foo")).toBeFalsy()
    })
  })
})
