import { describe, test, expect } from "vitest"

import { ensureDecimals } from "./ensureDecimals"

describe("shared/token/utils", () => {
  describe("ensureDecimals", () => {
    describe("when valid", () => {
      test("returns decimal value", () => {
        for (let decimals = 0; decimals < 18; decimals++) {
          expect(ensureDecimals(decimals)).toBe(decimals)
        }
      })
    })
    describe("when invalid", () => {
      test("returns default 18", () => {
        expect(ensureDecimals(undefined)).toBe(18)
        expect(ensureDecimals(null)).toBe(18)
        expect(ensureDecimals(NaN)).toBe(18)
        expect(ensureDecimals(Infinity)).toBe(18)
        expect(ensureDecimals("abc")).toBe(18)
        expect(ensureDecimals({})).toBe(18)
      })
    })
  })
})
