import { renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import {
  useSumTokenBalancesToCurrencyValue,
  useTokenBalanceToCurrencyValue,
  useTokenPriceDetails,
} from "../src/ui/features/accountTokens/tokenPriceHooks"
import mockApiPricesData from "./__mocks__/argent-api-prices.mock.json"
import mockApiTokenData from "./__mocks__/argent-api-tokens.mock.json"
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
          ccyDayChange: -0.008568,
          ccyValue: 1032.296954,
          ethDayChange: 0,
          ethValue: 1,
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
        expect(result.current).toEqual("1032.296954")
      })
      test("should convert token[1] balance to currency", () => {
        const { result } = renderHook(() =>
          useTokenBalanceToCurrencyValue(
            mockTokensWithBalance[1],
            useMockPriceAndTokenData,
          ),
        )
        expect(result.current).toEqual("0.999132444706")
      })
      test("should convert token[2] balance to currency", () => {
        const { result } = renderHook(() =>
          useTokenBalanceToCurrencyValue(
            mockTokensWithBalance[2],
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
        expect(result.current).toEqual("1034.298086444706")
      })
    })
  })

  /** TODO: as we are using SWR, the API data may previously be cached - so the value would simply be stale rather than undefined */
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
})
