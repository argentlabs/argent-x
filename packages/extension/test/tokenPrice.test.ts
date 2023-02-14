import { uint256 } from "starknet"
import { describe, expect, test } from "vitest"

import {
  PRETTY_UNLIMITED,
  convertTokenAmountToCurrencyValue,
  convertTokenUnitAmountWithDecimals,
  lookupTokenPriceDetails,
  prettifyCurrencyValue,
  prettifyTokenAmount,
  sumTokenBalancesToCurrencyValue,
} from "../src/shared/token/price"
import { TokenDetailsWithBalance } from "../src/ui/features/accountTokens/tokens.state"
import mockApiPricesDataInvalid from "./__fixtures__/argent-api-prices-invalid.mock.json"
import mockApiPricesData from "./__fixtures__/argent-api-prices.mock.json"
import mockApiTokenDataInvalid from "./__fixtures__/argent-api-tokens-invalid.mock.json"
import mockApiTokenData from "./__fixtures__/argent-api-tokens.mock.json"
import mockTokensWithBalanceRaw from "./__fixtures__/tokens-with-balance.mock.json"

const { UINT_256_MAX } = uint256

/** convert to expected types */
export const mockTokensWithBalance: TokenDetailsWithBalance[] =
  mockTokensWithBalanceRaw.map((token) => {
    return {
      ...token,
      decimals: Number(token.decimals),
      balance: BigInt(token.balance),
    }
  })

describe("convertTokenAmountToCurrencyValue()", () => {
  describe("when valid", () => {
    test("should convert token balance to currency value correctly", () => {
      expect(
        /** decimals may be of type BN in the wild */
        convertTokenAmountToCurrencyValue({
          amount: "1000000000000000000",
          decimals: 18,
          unitCurrencyValue: 1.23,
        }),
      ).toEqual("1.23")
      expect(
        convertTokenAmountToCurrencyValue({
          amount: "1000000000000000000",
          decimals: 18,
          unitCurrencyValue: "1032.296954",
        }),
      ).toEqual("1032.296954")
      expect(
        convertTokenAmountToCurrencyValue({
          amount: "20000000000000",
          decimals: 13,
          unitCurrencyValue: "1032.296954",
        }),
      ).toEqual("2064.593908")
      /** In pure JS the following case would lose precision - 1032.296954 * 3 = 3096.8908619999997 */
      expect(
        convertTokenAmountToCurrencyValue({
          amount: "30000000000",
          decimals: 10,
          unitCurrencyValue: "1032.296954",
        }),
      ).toEqual("3096.890862")
    })
  })
  describe("when invalid", () => {
    test("should return undefined without throwing", () => {
      expect(
        convertTokenAmountToCurrencyValue({
          amount: "30000000000",
          decimals: BigInt("10"),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          unitCurrencyValue: null,
        }),
      ).toBeUndefined()
      expect(
        convertTokenAmountToCurrencyValue({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          amount: null,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          decimals: null,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          unitCurrencyValue: null,
        }),
      ).toBeUndefined()
    })
  })
})

describe("lookupTokenPriceDetails()", () => {
  describe("when valid", () => {
    test("should find token price details in API response", () => {
      const token = mockTokensWithBalance[0]
      const price = lookupTokenPriceDetails({
        token,
        pricesData: mockApiPricesData,
        tokenData: mockApiTokenData,
      })
      expect(price).toEqual({
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

describe("sumTokenBalancesToCurrencyValue()", () => {
  describe("when valid", () => {
    test("should sum an array of tokens to currency value", () => {
      const result = sumTokenBalancesToCurrencyValue({
        tokens: mockTokensWithBalance,
        pricesData: mockApiPricesData,
        tokenData: mockApiTokenData,
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

describe("prettifyCurrencyValue()", () => {
  describe("when valid", () => {
    test("should return pretty currency value", () => {
      expect(prettifyCurrencyValue(0)).toEqual("$0.00")
      expect(prettifyCurrencyValue("0")).toEqual("$0.00")
      expect(prettifyCurrencyValue("1.23456")).toEqual("$1.23")
      expect(prettifyCurrencyValue("123456.12")).toEqual("$123,456.12")
      expect(prettifyCurrencyValue("123456.123456")).toEqual("$123,456.12")
      expect(prettifyCurrencyValue("0.12")).toEqual("$0.12")
      expect(prettifyCurrencyValue("0.123456")).toEqual("$0.12")
      expect(prettifyCurrencyValue("0.0123456")).toEqual("$0.012")
      expect(prettifyCurrencyValue("0.00123456")).toEqual("$0.0012")
      expect(prettifyCurrencyValue("0.000123456")).toEqual("$0.00012")
      expect(prettifyCurrencyValue("0.00000123")).toEqual("$0.0000012")
      expect(prettifyCurrencyValue("0.0008923088")).toEqual("$0.00089")
      expect(prettifyCurrencyValue("0.000885")).toEqual("$0.00089")
      expect(prettifyCurrencyValue("0.0000001")).toEqual("$0.0000001")
      expect(prettifyCurrencyValue("1.504")).toEqual("$1.50")
      expect(prettifyCurrencyValue("1.505")).toEqual("$1.51")
    })
  })
  describe("when invalid", () => {
    test("should return null", () => {
      expect(prettifyCurrencyValue()).toBeNull()
      expect(prettifyCurrencyValue("foo")).toBeNull()
    })
  })
})

describe("prettifyTokenAmount()", () => {
  describe("when valid", () => {
    test("should return pretty token value", () => {
      expect(
        prettifyTokenAmount({
          amount: 0,
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("0.0 ETH")
      expect(
        prettifyTokenAmount({
          amount: "1000000000000000000",
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("1.0 ETH")
      expect(
        prettifyTokenAmount({
          amount: "123456789000000000000000000",
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("123,456,789.0 ETH")
      expect(
        prettifyTokenAmount({
          amount: "123456789012345690000000000",
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("123,456,789.0123 ETH")
      expect(
        prettifyTokenAmount({
          amount: "12345678901234569000",
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("12.3457 ETH")
      expect(
        prettifyTokenAmount({
          amount: "12345678901234569",
          decimals: 18,
          symbol: "ETH",
        }),
      ).toEqual("0.0123 ETH")
      expect(
        prettifyTokenAmount({
          amount: "123456789000000000000000000",
          decimals: 18,
        }),
      ).toEqual("123,456,789.0")
      expect(
        prettifyTokenAmount({
          amount: "100",
          decimals: 18,
        }),
      ).toEqual("0.0000000000000001")
      expect(
        prettifyTokenAmount({
          amount: UINT_256_MAX.toString(),
          decimals: 18,
        }),
      ).toEqual(PRETTY_UNLIMITED)
    })
  })
  describe("when invalid", () => {
    test("should return null", () => {
      /** allow us to pass invalid arguments for testing purposes */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(prettifyTokenAmount({})).toBeNull()
    })
  })
})

describe("convertTokenUnitAmountWithDecimals()", () => {
  describe("when valid", () => {
    test("should convert token unit amount", () => {
      expect(
        convertTokenUnitAmountWithDecimals({ unitAmount: 0, decimals: 18 }),
      ).toEqual("0")
      expect(
        convertTokenUnitAmountWithDecimals({ unitAmount: 1.23, decimals: 2 }),
      ).toEqual("123")
      expect(
        convertTokenUnitAmountWithDecimals({
          unitAmount: 1.23456,
          decimals: 2,
        }),
      ).toEqual("123")
      expect(
        convertTokenUnitAmountWithDecimals({ unitAmount: 1, decimals: 5 }),
      ).toEqual("100000")
      expect(
        convertTokenUnitAmountWithDecimals({ unitAmount: 1, decimals: 18 }),
      ).toEqual("1000000000000000000")
      expect(
        convertTokenUnitAmountWithDecimals({
          unitAmount: "1.23456789",
          decimals: 18,
        }),
      ).toEqual("1234567890000000000")
    })
  })
  describe("when invalid", () => {
    test("should return undefined", () => {
      expect(
        convertTokenUnitAmountWithDecimals({ unitAmount: "foo" }),
      ).toBeUndefined()
    })
  })
})
