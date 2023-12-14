import { describe, expect, test } from "vitest"

import {
  addressOrDomainSchema,
  addressOrDomainInputSchema,
} from "./addressDomain"

describe("chains/starknet/address", () => {
  describe("addressOrDomainSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressOrDomainSchema.safeParse("foo.stark").success,
        ).toBeTruthy()
        expect(
          addressOrDomainSchema.safeParse("foo.argent.xyz").success,
        ).toBeTruthy()
        expect(
          addressOrDomainSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false with empty string", () => {
        expect(addressOrDomainSchema.safeParse("").success).toBeFalsy()
      })
      test("success should be false with only .stark suffix", () => {
        expect(addressOrDomainSchema.safeParse(".stark").success).toBeFalsy()
      })
      test("success should be false with only .argent.xyz suffix", () => {
        expect(
          addressOrDomainSchema.safeParse(".argent.xyz").success,
        ).toBeFalsy()
      })
      test("success should be false when address too long", () => {
        expect(
          addressOrDomainSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a00",
          ).success,
        ).toBeFalsy()
      })
      test("success should be false when address too short", () => {
        expect(
          addressOrDomainSchema.safeParse("0x7e00d496e32").success,
        ).toBeFalsy()
      })
      test("success should be false when starkname not exists", () => {
        expect(addressOrDomainSchema.safeParse("123.star").success).toBeFalsy()
      })
      test("success should be false when starkname has random characters", () => {
        expect(
          addressOrDomainSchema.safeParse("123###1@@! ^%.star").success,
        ).toBeFalsy()
      })
    })
  })
  describe("addressInputSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressOrDomainInputSchema.safeParse(
            "0x07e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
        expect(
          addressOrDomainInputSchema.safeParse(
            "0x07E00d496E324876BbC8531f2D9A82bf154d1A04a50218eE74CdD372F75a551A",
          ).success,
        ).toBeTruthy()
        expect(
          addressOrDomainInputSchema.safeParse("e2e-test.stark").success,
        ).toBeTruthy()
        expect(
          addressOrDomainInputSchema.safeParse("e2e-test.argent.xyz").success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(() =>
          addressOrDomainInputSchema.parse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ),
        ).toThrowError("Address must be 66 characters long")
        expect(() =>
          addressOrDomainInputSchema.parse(
            "0x07E00d496E324876BbC8531f2D9A82bf154d1A04a50218eE74CdD372F75a551a",
          ),
        ).toThrowError("Invalid address (checksum error)")
        expect(() =>
          addressOrDomainInputSchema.parse(
            "0x97e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ),
        ).toThrowError("Invalid address (validation error)")
        expect(() => addressOrDomainInputSchema.parse("..stark")).toThrowError(
          "Invalid address",
        )
        expect(() => addressOrDomainInputSchema.parse("!?.stark")).toThrowError(
          "Invalid address",
        )
        expect(() =>
          addressOrDomainInputSchema.parse("..argent.xyz"),
        ).toThrowError("Invalid address")
        expect(() =>
          addressOrDomainInputSchema.parse("!?.argent.xyz"),
        ).toThrowError("Invalid address")
      })
    })
  })
})
