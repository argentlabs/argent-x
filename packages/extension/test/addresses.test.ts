import { describe, expect, test } from "vitest"

import { isEqualAddress } from "../src/ui/services/addresses"

describe("isEqualAddress", () => {
  describe("when valid", () => {
    test("should match same address", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
    })
    test("should match same address regardless of zero padding", () => {
      expect(
        isEqualAddress(
          "0x33d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
      expect(
        isEqualAddress(
          "33d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
        ),
      ).toBe(true)
    })
    test("should match regardless of case", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "0x033D2A165D2A2AE64CBAF8E6DFF7F0C1974D0F41CD4F0C24D273373D4837BCFD",
        ),
      ).toBe(true)
    })
  })
  describe("when invalid", () => {
    test("should return false without throwing", () => {
      expect(
        isEqualAddress(
          "0x033d2a165d2a2ae64cbaf8e6dff7f0c1974d0f41cd4f0c24d273373d4837bcfd",
          "foo",
        ),
      ).toBe(false)
      expect(isEqualAddress("foo", "foo")).toBe(false)
    })
  })
})
