import { num } from "starknet"

import {
  isNumeric,
  prettifyCurrencyNumber,
  prettifyNumber,
  prettifyTokenNumber,
} from "../../src/shared/utils/number"

const { toBigInt } = num

describe("prettifyNumber()", () => {
  describe("when valid", () => {
    describe("when using default currency config", () => {
      test("should return pretty currency value", () => {
        expect(prettifyCurrencyNumber(0)).toEqual("0.00")
        expect(prettifyCurrencyNumber("0")).toEqual("0.00")
        expect(prettifyCurrencyNumber("1.23456")).toEqual("1.23")
        expect(prettifyCurrencyNumber("123456.12")).toEqual("123,456.12")
        expect(prettifyCurrencyNumber("123456.123456")).toEqual("123,456.12")
        expect(prettifyCurrencyNumber("0.12")).toEqual("0.12")
        expect(prettifyCurrencyNumber("0.123456")).toEqual("0.12")
        expect(prettifyCurrencyNumber("0.0123456")).toEqual("0.012")
        expect(prettifyCurrencyNumber("0.00123456")).toEqual("0.0012")
        expect(prettifyCurrencyNumber("0.000123456")).toEqual("0.00012")
        expect(prettifyCurrencyNumber("0.00000123")).toEqual("0.0000012")
        expect(prettifyCurrencyNumber("0.0008923088")).toEqual("0.00089")
        expect(prettifyCurrencyNumber("0.000885")).toEqual("0.00089")
        expect(prettifyCurrencyNumber("0.0000001")).toEqual("0.0000001")
        expect(prettifyCurrencyNumber("1.504")).toEqual("1.50")
        expect(prettifyCurrencyNumber("1.505")).toEqual("1.51")
        expect(prettifyCurrencyNumber("1199.05823328686698812")).toEqual(
          "1,199.06",
        )
        expect(prettifyCurrencyNumber(1234n)).toEqual("1,234.00")
      })
    })
    describe("when using default token config", () => {
      test("should return pretty token value", () => {
        expect(prettifyTokenNumber(0)).toEqual("0.0")
        expect(prettifyTokenNumber("0")).toEqual("0.0")
        expect(prettifyTokenNumber("1.23456")).toEqual("1.2346")
        expect(prettifyTokenNumber("123456.12")).toEqual("123,456.12")
        expect(prettifyTokenNumber("123456.12015")).toEqual("123,456.1202")
        expect(prettifyTokenNumber("123456.123456")).toEqual("123,456.1235")
        expect(prettifyTokenNumber("0.12")).toEqual("0.12")
        expect(prettifyTokenNumber("0.123456")).toEqual("0.1235")
        expect(prettifyTokenNumber("0.0123456")).toEqual("0.0123")
        expect(prettifyTokenNumber("0.00123456")).toEqual("0.0012")
        expect(prettifyTokenNumber("0.000123456")).toEqual("0.00012")
        expect(prettifyTokenNumber("0.00000123")).toEqual("0.0000012")
        expect(prettifyTokenNumber("0.0008923088")).toEqual("0.00089")
        expect(prettifyTokenNumber("0.000885")).toEqual("0.00089")
        expect(prettifyTokenNumber("0.0000001")).toEqual("0.0000001")
        expect(prettifyTokenNumber("1.50004")).toEqual("1.5")
        expect(prettifyTokenNumber("1.50005")).toEqual("1.5001")
        expect(prettifyTokenNumber("123456789")).toEqual("123,456,789.0")
        expect(prettifyTokenNumber(123456789n)).toEqual("123,456,789.0")
      })
    })
  })
  describe("when invalid", () => {
    test("should return null", () => {
      /** allow us to pass invalid arguments for testing purposes */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(prettifyNumber()).toBeNull()
      expect(prettifyNumber("foo")).toBeNull()
    })
  })
})

describe("isNumeric()", () => {
  describe("when valid", () => {
    test("should return true", () => {
      expect(isNumeric(0)).toBeTruthy()
      expect(isNumeric("123")).toBeTruthy()
      expect(isNumeric(BigInt(123))).toBeTruthy()
      expect(isNumeric(toBigInt(123))).toBeTruthy()
      expect(isNumeric(123n)).toBeTruthy()
    })
  })
  describe("when invalid", () => {
    test("should return false", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(isNumeric()).toBeFalsy()
      expect(isNumeric("")).toBeFalsy()
      expect(isNumeric({})).toBeFalsy()
      expect(isNumeric(null)).toBeFalsy()
      expect(isNumeric(true)).toBeFalsy()
      expect(isNumeric(false)).toBeFalsy()
      expect(isNumeric(NaN)).toBeFalsy()
    })
  })
})
