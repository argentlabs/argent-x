import { describe, expect, test } from "vitest"

import { addressSchema, isEqualAddress, isZeroAddress } from "./address"

describe("chains/starknet/address", () => {
  describe("addressSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
        expect(
          addressSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee7",
          ).success,
        ).toBeTruthy()
        // checksum
        expect(
          addressSchema.safeParse(
            "0x02b4cEFEABc0a31e7F457dDaD679b637Ff567bAeb43aF8Ccc4bA11d47590D1d6",
          ).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(addressSchema.safeParse("").success).toBeFalsy()
        expect(
          addressSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a00",
          ).success,
        ).toBeFalsy()
        expect(addressSchema.safeParse("foo").success).toBeFalsy()
        // checksum
        expect(
          addressSchema.safeParse(
            "0x02b4cEFEABc0a31e7F457dDaD679b637Ff567bAeb43aF8Ccc4bA11d47590D1d6w",
          ).success,
        ).toBeFalsy()
        // causes bigint exception in snjs
        expect(
          addressSchema.safeParse(
            "0x02b4cefeabc0a31e7f457ddad679b637ff567baeb43af8ccc4ba11d47590d1d6w",
          ).success,
        ).toBeFalsy()
        // checksum with one uppercase changed to lower
        expect(
          addressSchema.safeParse(
            "0x02b4ceFEABc0a31e7F457dDaD679b637Ff567bAeb43aF8Ccc4bA11d47590D1d6",
          ).success,
        ).toBeFalsy()
      })
    })
  })
  describe("isZeroAddress", () => {
    describe("when valid", () => {
      test("should return true", () => {
        expect(isZeroAddress("0x0")).toBeTruthy()
        expect(
          isZeroAddress(
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("should return false", () => {
        expect(isZeroAddress("")).toBeFalsy()
        expect(isZeroAddress("0x")).toBeFalsy()
        expect(isZeroAddress("0x1")).toBeFalsy()
        expect(
          isZeroAddress(
            "0x02b4cEFEABc0a31e7F457dDaD679b637Ff567bAeb43aF8Ccc4bA11d47590D1d6",
          ),
        ).toBeFalsy()
        expect(isZeroAddress("0")).toBeFalsy()
      })
    })
  })
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
})
