/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react"

import {
  useSumTokenBalancesToCurrencyValue,
  useTokenBalanceToCurrencyValue,
  useTokenPriceDetails,
} from "../src/ui/features/accountTokens/tokens.service"
import { TokenDetailsWithBalance } from "../src/ui/features/accountTokens/tokens.state"
import mockApiPricesData from "./argent-api-prices.mock.json"
import mockApiTokenData from "./argent-api-tokens.mock.json"
import { mockTokensWithBalance } from "./tokens.test"

describe("tokens-react", () => {
  const token = mockTokensWithBalance[0] as TokenDetailsWithBalance
  const usePriceAndTokenDataImpl = () => {
    return {
      pricesData: mockApiPricesData,
      tokenData: mockApiTokenData,
    }
  }

  describe("useTokenPriceDetails()", () => {
    test("should find token price details", () => {
      const { result } = renderHook(() =>
        useTokenPriceDetails(token, usePriceAndTokenDataImpl),
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
    test("should convert token balance to currency 0", () => {
      const { result } = renderHook(() =>
        useTokenBalanceToCurrencyValue(token, usePriceAndTokenDataImpl),
      )
      expect(result.current).toEqual("1032.296954")
    })
    test("should convert token balance to currency 1", () => {
      const { result } = renderHook(() =>
        useTokenBalanceToCurrencyValue(
          mockTokensWithBalance[1],
          usePriceAndTokenDataImpl,
        ),
      )
      expect(result.current).toEqual("0.999132")
    })
    test("should convert token balance to currency 2", () => {
      const { result } = renderHook(() =>
        useTokenBalanceToCurrencyValue(
          mockTokensWithBalance[2],
          usePriceAndTokenDataImpl,
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
          usePriceAndTokenDataImpl,
        ),
      )
      expect(result.current).toEqual("1034.2980859999998")
    })
  })
})
