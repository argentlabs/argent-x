import { renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import {
  useSumTokenBalancesToCurrencyValue,
  useTokenBalanceToCurrencyValue,
  useTokenPriceDetails,
} from "../src/ui/features/accountTokens/tokenPriceHooks"
import mockApiPricesDataInvalid from "./__fixtures__/argent-api-prices-invalid.mock.json"
import mockApiPricesData from "./__fixtures__/argent-api-prices.mock.json"
import mockApiTokenDataInvalid from "./__fixtures__/argent-api-tokens-invalid.mock.json"
import mockApiTokenData from "./__fixtures__/argent-api-tokens.mock.json"
import { mockTokensWithBalance } from "./tokenPrice.test"

describe("tokenPriceHooks", () => {
  describe("when API data is available", () => {
    const useMockPriceAndTokenData = () => {
      return {
        pricesData: mockApiPricesData,
        tokenData: mockApiTokenData,
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
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("1103.596564")
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
