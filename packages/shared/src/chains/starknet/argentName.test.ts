import { describe, expect, test } from "vitest"

import { argentNameSchema, isArgentName, isEqualArgentName } from "./argentName"

describe("chains/starknet/address", () => {
  describe("argentNameSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(argentNameSchema.safeParse("f.argent.xyz").success).toBeTruthy()
        expect(
          argentNameSchema.safeParse("foo.argent.xyz").success,
        ).toBeTruthy()
        expect(
          argentNameSchema.safeParse("foobar.argent.xyz").success,
        ).toBeTruthy()
        expect(
          argentNameSchema.safeParse("abcdefg1234567.argent.xyz").success,
        ).toBeTruthy()
        expect(
          argentNameSchema.safeParse("fooz.bar.argent.xyz").success,
        ).toBeTruthy()
        expect(
          argentNameSchema.safeParse("1234567890.bar.argent.xyz").success,
        ).toBeTruthy()
        expect(
          argentNameSchema.safeParse("e2e-test.argent.xyz").success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(argentNameSchema.safeParse("").success).toBeFalsy()
        expect(argentNameSchema.safeParse("foo").success).toBeFalsy()
        expect(argentNameSchema.safeParse("..argent.xyz").success).toBeFalsy()
        expect(argentNameSchema.safeParse(".argent.xyz").success).toBeFalsy()
        expect(argentNameSchema.safeParse("!??.argent.xyz").success).toBeFalsy()
      })
    })
  })
  describe("isArgentName", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(isArgentName("f.argent.xyz")).toBeTruthy()
        expect(isArgentName("foo.argent.xyz")).toBeTruthy()
        expect(isArgentName("foobar.argent.xyz")).toBeTruthy()
        expect(isArgentName("fooz.bar.argent.xyz")).toBeTruthy()
        expect(isArgentName("12356789.bar.argent.xyz")).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(isArgentName("")).toBeFalsy()
        expect(isArgentName("foo")).toBeFalsy()
        expect(isArgentName("..argent.xyz")).toBeFalsy()
        expect(isArgentName(".argent.xyz")).toBeFalsy()
        expect(isArgentName("!??.argent.xyz")).toBeFalsy()
      })
    })
  })
  describe("isEqualArgentName", () => {
    describe("when valid", () => {
      test("should return true", () => {
        expect(isEqualArgentName("f.argent.xyz", "f.argent.xyz")).toBeTruthy()
        expect(
          isEqualArgentName("foo.argent.xyz", "foo.argent.xyz"),
        ).toBeTruthy()
        expect(
          isEqualArgentName("foobar.argent.xyz", "foobar.argent.xyz"),
        ).toBeTruthy()
        expect(
          isEqualArgentName("fooz.bar.argent.xyz", "fooz.bar.argent.xyz"),
        ).toBeTruthy()
        expect(
          isEqualArgentName(
            "12356789.bar.argent.xyz",
            "12356789.bar.argent.xyz",
          ),
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("should return false", () => {
        expect(isEqualArgentName("")).toBeFalsy()
        expect(isEqualArgentName("foo", "foo.argent.xyz")).toBeFalsy()
        expect(isEqualArgentName("..argent.xyz", ".argent.xyz")).toBeFalsy()
        expect(isEqualArgentName(".argent.xyz", ".argent.xyz")).toBeFalsy()
        expect(
          isEqualArgentName("!??.argent.xyz", "!??.argent.xyz"),
        ).toBeFalsy()
      })
    })
  })
})
