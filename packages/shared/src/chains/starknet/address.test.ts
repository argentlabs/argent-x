import { describe, expect, test } from "vitest"

import { addressSchema } from "./address"

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
})
