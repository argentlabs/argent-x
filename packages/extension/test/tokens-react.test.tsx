/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react"

import {
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
    test("should convert token balance to currency", () => {
      const { result } = renderHook(() =>
        useTokenBalanceToCurrencyValue(token, usePriceAndTokenDataImpl),
      )
      expect(result.current).toEqual("1032.296954")
    })
  })
})
