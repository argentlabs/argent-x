import { describe, expect, test } from "vitest"

import {
  addressOrStarknetIdSchema,
  isEqualStarknetId,
  isStarknetId,
  starknetIdSchema,
} from "./starknetId"

describe("chains/starknet/address", () => {
  describe("starknetIdSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(starknetIdSchema.safeParse("f.stark").success).toBeTruthy()
        expect(starknetIdSchema.safeParse("foo.stark").success).toBeTruthy()
        expect(starknetIdSchema.safeParse("foobar.stark").success).toBeTruthy()
        expect(
          starknetIdSchema.safeParse("abcdefg1234567.stark").success,
        ).toBeTruthy()
        expect(
          starknetIdSchema.safeParse("fooz.bar.stark").success,
        ).toBeTruthy()
        expect(
          starknetIdSchema.safeParse("1234567890.bar.stark").success,
        ).toBeTruthy()
        expect(
          starknetIdSchema.safeParse("e2e-test.stark").success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(starknetIdSchema.safeParse("").success).toBeFalsy()
        expect(starknetIdSchema.safeParse("foo").success).toBeFalsy()
        expect(starknetIdSchema.safeParse("..stark").success).toBeFalsy()
        expect(starknetIdSchema.safeParse(".stark").success).toBeFalsy()
        expect(starknetIdSchema.safeParse("!??.stark").success).toBeFalsy()
      })
    })
  })
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
      test("success should be false", () => {
        expect(addressOrStarknetIdSchema.safeParse("").success).toBeFalsy()
        expect(
          addressOrStarknetIdSchema.safeParse(".stark").success,
        ).toBeFalsy()
        expect(
          addressOrStarknetIdSchema.safeParse(
            "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a00",
          ).success,
        ).toBeFalsy()
      })
    })
  })
  describe("isStarknetId", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(isStarknetId("f.stark")).toBeTruthy()
        expect(isStarknetId("foo.stark")).toBeTruthy()
        expect(isStarknetId("foobar.stark")).toBeTruthy()
        expect(isStarknetId("fooz.bar.stark")).toBeTruthy()
        expect(isStarknetId("12356789.bar.stark")).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(isStarknetId("")).toBeFalsy()
        expect(isStarknetId("foo")).toBeFalsy()
        expect(isStarknetId("..stark")).toBeFalsy()
        expect(isStarknetId(".stark")).toBeFalsy()
        expect(isStarknetId("!??.stark")).toBeFalsy()
      })
    })
  })
  describe("isEqualStarknetId", () => {
    describe("when valid", () => {
      test("should return true", () => {
        expect(isEqualStarknetId("f.stark", "f.stark")).toBeTruthy()
        expect(isEqualStarknetId("foo.stark", "foo.stark")).toBeTruthy()
        expect(isEqualStarknetId("foobar.stark", "foobar.stark")).toBeTruthy()
        expect(
          isEqualStarknetId("fooz.bar.stark", "fooz.bar.stark"),
        ).toBeTruthy()
        expect(
          isEqualStarknetId("12356789.bar.stark", "12356789.bar.stark"),
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("should return false", () => {
        expect(isEqualStarknetId("")).toBeFalsy()
        expect(isEqualStarknetId("foo", "foo.stark")).toBeFalsy()
        expect(isEqualStarknetId("..stark", ".stark")).toBeFalsy()
        expect(isEqualStarknetId(".stark", ".stark")).toBeFalsy()
        expect(isEqualStarknetId("!??.stark", "!??.stark")).toBeFalsy()
      })
    })
  })
})
