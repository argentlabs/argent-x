import { describe, expect, test } from "vitest"

import { addressOrStarknetIdSchema } from "./addressStarknetId"

describe("chains/starknet/address", () => {
  describe("addressOrStarknetIdSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressOrStarknetIdSchema.safeParse("foo.stark").success,
        ).toBeTruthy()
        expect(
          addressOrStarknetIdSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false with empty string", () => {
        expect(addressOrStarknetIdSchema.safeParse("").success).toBeFalsy()
      })
      test("success should be false with only .stark suffix", () => {
        expect(
          addressOrStarknetIdSchema.safeParse(".stark").success,
        ).toBeFalsy()
      })
      test("success should be false when address too long", () => {
        expect(
          addressOrStarknetIdSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a00",
          ).success,
        ).toBeFalsy()
      })
      test("success should be false when address too short", () => {
        expect(
          addressOrStarknetIdSchema.safeParse("0x7e00d496e32").success,
        ).toBeFalsy()
      })
      test("success should be false when starkname not exists", () => {
        expect(
          addressOrStarknetIdSchema.safeParse("123.star").success,
        ).toBeFalsy()
      })
      test("success should be false when starkname has random characters", () => {
        expect(
          addressOrStarknetIdSchema.safeParse("123###1@@! ^%.star").success,
        ).toBeFalsy()
      })
    })
  })
})
