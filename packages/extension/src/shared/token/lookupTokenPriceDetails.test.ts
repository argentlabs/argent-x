import { convertTokenAmountToCurrencyValue } from "@argent/x-shared"
import { describe, expect, test } from "vitest"

import { lookupTokenPriceDetails } from "./lookupTokenPriceDetails"
import mockApiPricesData from "../../../test/__fixtures__/argent-api-prices.mock.json"
import mockApiTokenData from "../../../test/__fixtures__/argent-api-tokens.mock.json"
import { mockTokensWithBalance } from "./__fixtures__/mockTokensWithBalance"

describe("lookupTokenPriceDetails()", () => {
  describe("when valid", () => {
    test("should find token price details in API response", () => {
      const token = mockTokensWithBalance[0]
      const price = lookupTokenPriceDetails({
        token,
        pricesData: mockApiPricesData as any,
        tokenData: mockApiTokenData as any,
      })
      expect(price).toEqual({
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        networkId: "sepolia-alpha",
        ccyDayChange: "0.001484",
        ccyValue: "1102.594564",
        ethDayChange: "0",
        ethValue: "1",
        pricingId: 1,
      })
      expect(
        convertTokenAmountToCurrencyValue({
          amount: token.balance || 0,
          decimals: token.decimals || 0,
          unitCurrencyValue: price?.ccyValue || 0,
        }),
      ).toEqual("1102.594564")
    })
  })
  describe("when invalid", () => {
    test("should return undefined without throwing", () => {
      const token = mockTokensWithBalance[0]
      const price = lookupTokenPriceDetails({
        token,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pricesData: null,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tokenData: null,
      })
      expect(price).toBeUndefined()
    })
  })
})
