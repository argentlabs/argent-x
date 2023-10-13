import { describe, expect, test } from "vitest"

import { amountInputSchema } from "./amountInput"

describe("send", () => {
  describe("inputAmountSchema", () => {
    describe("when valid", () => {
      test("success should be true", () => {
        expect(amountInputSchema.safeParse("").success).toBeTruthy()
        expect(amountInputSchema.safeParse("0").success).toBeTruthy()
        expect(amountInputSchema.safeParse(".").success).toBeTruthy()
        expect(amountInputSchema.safeParse(".1").success).toBeTruthy()
        expect(amountInputSchema.safeParse(".00").success).toBeTruthy()
        expect(amountInputSchema.safeParse("0.00").success).toBeTruthy()
        expect(amountInputSchema.safeParse("1234567890").success).toBeTruthy()
        expect(
          amountInputSchema.safeParse("1234567890.123456789012345678").success,
        ).toBeTruthy()
      })
    })
    describe("when invalid", () => {
      test("success should be false", () => {
        expect(amountInputSchema.safeParse("..").success).toBeFalsy()
        expect(amountInputSchema.safeParse("00").success).toBeFalsy()
        expect(amountInputSchema.safeParse("s").success).toBeFalsy()
        expect(
          amountInputSchema.safeParse("1234567890.12345678901234567890")
            .success,
        ).toBeFalsy()
        expect(amountInputSchema.safeParse("foo").success).toBeFalsy()
      })
    })
  })
})
