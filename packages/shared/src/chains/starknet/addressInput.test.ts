import { describe, expect, test } from "vitest"

import {
  addressInputCharactersAndLengthSchema,
  addressOrStarknetIdInputSchema,
} from "./addressInput"

describe("chains/starknet/address", () => {
  describe("addressInputSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressOrStarknetIdInputSchema.safeParse(
            "0x07e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
        expect(
          addressOrStarknetIdInputSchema.safeParse(
            "0x07E00d496E324876BbC8531f2D9A82bf154d1A04a50218eE74CdD372F75a551A",
          ).success,
        ).toBeTruthy()
        expect(
          addressOrStarknetIdInputSchema.safeParse("e2e-test.stark").success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(() =>
          addressOrStarknetIdInputSchema.parse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ),
        ).toThrowError("Address must be 66 characters long")
        expect(() =>
          addressOrStarknetIdInputSchema.parse(
            "0x07E00d496E324876BbC8531f2D9A82bf154d1A04a50218eE74CdD372F75a551a",
          ),
        ).toThrowError("Invalid address (checksum error)")
        expect(() =>
          addressOrStarknetIdInputSchema.parse(
            "0x97e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ),
        ).toThrowError("Invalid address (validation error)")
        expect(() =>
          addressOrStarknetIdInputSchema.parse("..stark"),
        ).toThrowError("Invalid address")
        expect(() =>
          addressOrStarknetIdInputSchema.parse("!?.stark"),
        ).toThrowError("Invalid address")
      })
    })
  })
  describe("addressInputCharactersAndLengthSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(
          addressInputCharactersAndLengthSchema.safeParse("").success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("f.stark").success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("foo.stark").success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("foobar.stark")
            .success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(
            "abcdefg1234567.stark",
          ).success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("fooz.bar.stark")
            .success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("0x0").success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
          ).success,
        ).toBeTruthy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("e2e-test.stark")
            .success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(
          addressInputCharactersAndLengthSchema.safeParse("\n").success,
        ).toBeFalsy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(" ").success,
        ).toBeFalsy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse("\r").success,
        ).toBeFalsy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(" fooz.bar.stark")
            .success,
        ).toBeFalsy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(
            "fooz. \nbar. \tstark ",
          ).success,
        ).toBeFalsy()
        expect(
          addressInputCharactersAndLengthSchema.safeParse(" foo   o o ")
            .success,
        ).toBeFalsy()
      })
    })
  })
})
