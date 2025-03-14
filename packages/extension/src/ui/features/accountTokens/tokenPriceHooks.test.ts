import { renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import {
  prettifyCurrenvyValueForSwap,
  prettifyTokenAmountValueForSwap,
  useCurrencyValueToTokenAmount,
  useSumTokenBalancesToCurrencyValue,
  useTokenAmountToCurrencyFormatted,
  useTokenBalanceToCurrencyValue,
  useTokenPriceDetails,
} from "./tokenPriceHooks"
import mockApiPricesDataInvalid from "../../../../test/__fixtures__/argent-api-prices-invalid.mock.json"
import mockApiPricesData from "../../../../test/__fixtures__/argent-api-prices.mock.json"
import mockApiTokenDataInvalid from "../../../../test/__fixtures__/argent-api-tokens-invalid.mock.json"
import mockApiTokenData from "../../../../test/__fixtures__/argent-api-tokens.mock.json"
import { mockTokensWithBalance } from "../../../shared/token/__fixtures__/mockTokensWithBalance"

describe("tokenPriceHooks", () => {
  describe("when API data is available", () => {
    const useMockPriceAndTokenData = () => {
      return {
        pricesData: mockApiPricesData as any,
        tokenData: mockApiTokenData as any,
      }
    }

    describe("useTokenPriceDetails()", () => {
      test("should find token price details", () => {
        const { result } = renderHook(() =>
          useTokenPriceDetails(
            mockTokensWithBalance[0],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual({
          address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          networkId: "sepolia-alpha",
          ccyDayChange: "0.001484",
          ccyValue: "1102.594564",
          ethDayChange: "0",
          ethValue: "1",
          pricingId: 1,
        })
      })
    })

    describe("useTokenAmountToCurrencyValue()", () => {
      test("should convert token[0] balance to currency", () => {
        const { result } = renderHook(() =>
          useTokenBalanceToCurrencyValue(
            mockTokensWithBalance[0],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1102.594564")
      })
      test("should convert token[1] balance to currency", () => {
        const { result } = renderHook(() =>
          useTokenBalanceToCurrencyValue(
            mockTokensWithBalance[1],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1.002")
      })
    })

    describe("useSumTokenBalancesToCurrencyValue()", () => {
      test("should convert and sum token balances to currency", () => {
        const { result } = renderHook(() =>
          useSumTokenBalancesToCurrencyValue(
            mockTokensWithBalance,
            undefined,
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1103.596564")
      })
    })

    describe("useTokenValueConverter()", () => {
      test("should convert currency to token amount", () => {
        const { result } = renderHook(() =>
          useCurrencyValueToTokenAmount(
            "1102.594564",
            mockTokensWithBalance[0],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1.0")
      })

      test("should convert token amount to currency", () => {
        const { result } = renderHook(() =>
          useTokenAmountToCurrencyFormatted(
            "1000000000000000000",
            mockTokensWithBalance[0],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1102.59")
      })
    })
  })

  describe("when API data is not available", () => {
    const usePriceAndTokenDataImpl = () => {
      return {
        pricesData: undefined,
        tokenData: undefined,
      }
    }
    describe("useTokenPriceDetails()", () => {
      test("should return undefined without throwing", () => {
        const { result } = renderHook(() =>
          useTokenPriceDetails(
            mockTokensWithBalance[0],
            usePriceAndTokenDataImpl,
          ),
        )
        expect(result.current).toBeUndefined()
      })
    })
    describe("useSumTokenBalancesToCurrencyValue()", () => {
      test("should return undefined without throwing", () => {
        const { result } = renderHook(() =>
          useSumTokenBalancesToCurrencyValue(
            mockTokensWithBalance,
            undefined,
            usePriceAndTokenDataImpl,
          ),
        )
        expect(result.current).toBeUndefined()
      })
    })
  })

  describe("when API data is invalid", () => {
    const usePriceAndTokenDataImpl = () => {
      return {
        pricesData: mockApiPricesDataInvalid,
        tokenData: mockApiTokenDataInvalid,
      }
    }
    describe("useTokenPriceDetails()", () => {
      test("should return undefined without throwing", () => {
        const { result } = renderHook(() =>
          useTokenPriceDetails(
            mockTokensWithBalance[0],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            usePriceAndTokenDataImpl,
          ),
        )
        expect(result.current).toBeUndefined()
      })
    })
    describe("useSumTokenBalancesToCurrencyValue()", () => {
      test("should return undefined without throwing", () => {
        const { result } = renderHook(() =>
          useSumTokenBalancesToCurrencyValue(
            mockTokensWithBalance,
            "sepolia-alpha",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            usePriceAndTokenDataImpl,
          ),
        )
        expect(result.current).toBeUndefined()
      })
    })
  })
})

describe("formatting functions", () => {
  describe("prettifyTokenAmountValueForSwap", () => {
    test("should format token amounts correctly", () => {
      const testCases = [
        { input: "1.23456789", expected: "1.234567" },
        { input: "0.00123456", expected: "0.001234" },
        { input: "123456.789123456", expected: "123456.7891" },
        { input: "1000", expected: "1000.0" },
        { input: undefined, expected: "0" },
        { input: "0", expected: "0" },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(prettifyTokenAmountValueForSwap(input)).toBe(expected)
      })
    })
  })

  describe("prettifyCurrenvyValueForSwap", () => {
    test("should format currency values correctly", () => {
      const testCases = [
        { input: "1.23456789", expected: "1.23" },
        { input: "0.00123456", expected: "0.0012" },
        { input: "123456.789123456", expected: "123456.78" },
        { input: "1000.5", expected: "1000.50" },
        { input: undefined, expected: undefined },
        { input: "999999.99", expected: "999999.99" },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(prettifyCurrenvyValueForSwap(input)).toBe(expected)
      })
    })
  })
})
