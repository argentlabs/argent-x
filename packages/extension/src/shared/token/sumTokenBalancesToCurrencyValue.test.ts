import { describe, expect, test } from "vitest"

import { sumTokenBalancesToCurrencyValue } from "./sumTokenBalancesToCurrencyValue"
import mockApiPricesDataInvalid from "../../../test/__fixtures__/argent-api-prices-invalid.mock.json"
import mockApiPricesData from "../../../test/__fixtures__/argent-api-prices.mock.json"
import mockApiTokenDataInvalid from "../../../test/__fixtures__/argent-api-tokens-invalid.mock.json"
import mockApiTokenData from "../../../test/__fixtures__/argent-api-tokens.mock.json"
import { mockTokensWithBalance } from "./__fixtures__/mockTokensWithBalance"

describe("sumTokenBalancesToCurrencyValue()", () => {
  describe("when valid", () => {
    test("should sum an array of tokens to currency value", () => {
      const result = sumTokenBalancesToCurrencyValue({
        tokens: mockTokensWithBalance,
        pricesData: mockApiPricesData as any,
        tokenData: mockApiTokenData as any,
      })
      expect(result).toEqual("1103.596564")
    })
  })
  describe("when invalid", () => {
    test("should return undefined without throwing", () => {
      const result = sumTokenBalancesToCurrencyValue({
        tokens: mockTokensWithBalance,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pricesData: mockApiPricesDataInvalid,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tokenData: mockApiTokenDataInvalid,
      })
      expect(result).toBeUndefined()
    })
  })
})
