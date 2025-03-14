import { constants } from "starknet"
import { getMockBaseToken, getMockToken } from "../../../../../test/token.mock"
import { ETH, USDC } from "../../../../shared/token/__new/constants"
import type { BaseToken } from "../../../../shared/token/__new/types/token.model"
import {
  bipsToPercent,
  isETH,
  maxAmountSpend,
  maxAmountSpendFromTokenBalance,
  predefinedSortOrder,
  sortSwapTokens,
  getProvidersFromTradeRoute,
} from "./index"

describe("swap utils", () => {
  describe("isETH", () => {
    it("should return true if the token is ETH", () => {
      const token: BaseToken = {
        ...ETH[constants.StarknetChainId.SN_MAIN],
      }
      expect(isETH(token)).toBe(true)
    })

    it("should return false if the token is not ETH", () => {
      const token: BaseToken = {
        ...USDC[constants.StarknetChainId.SN_MAIN],
      }
      expect(isETH(token)).toBe(false)
    })
  })

  describe("maxAmountSpendFromTokenBalance", () => {
    it("should return undefined if tokenBalance is not provided", () => {
      expect(maxAmountSpendFromTokenBalance(undefined)).toBeUndefined()
    })

    it("should return undefined if tokenBalance has no balance", () => {
      const tokenBalance = {
        ...getMockToken(),
        balance: undefined,
      }
      expect(maxAmountSpendFromTokenBalance(tokenBalance)).toBeUndefined()
    })

    it("should return the correct max amount spendable", () => {
      const tokenBalance = {
        balance: 100000000000000000n,
        ...getMockToken(),
      }
      expect(maxAmountSpendFromTokenBalance(tokenBalance)).toBe(
        tokenBalance.balance,
      )
    })
  })

  describe("maxAmountSpend", () => {
    it("should return undefined if tokenAmount is not provided", () => {
      expect(maxAmountSpend(undefined)).toBeUndefined()
    })

    it("should return the full amount if the token is not ETH", () => {
      const tokenAmount = {
        amount: 100000000000000000n,
        ...getMockBaseToken(),
      }
      expect(maxAmountSpend(tokenAmount)).toBe(tokenAmount.amount)
    })
  })

  describe("bipsToPercent", () => {
    it("should convert bips to percent correctly", () => {
      const bips = 100 // 1%
      const percent = bipsToPercent(bips)
      expect(percent.value).toBe(BigInt(1))
      expect(percent.decimals).toBe(2)
    })
  })

  describe("sortSwapTokens", () => {
    it("sorts tokens by predefined order when applicable, then alphabetically", () => {
      const mockTokens = [
        getMockToken({ symbol: "DAI" }),
        getMockToken({ symbol: "ETH" }),
        getMockToken({ symbol: "ZEND" }),
        getMockToken({ symbol: "BAT" }),
        getMockToken({ symbol: "USDC" }),
        getMockToken({ symbol: "SOL" }),
        getMockToken({ symbol: "BTC" }),
      ]

      const expectedOrder = ["ETH", "USDC", "DAI", "ZEND", "BAT", "BTC", "SOL"]

      const result = sortSwapTokens(mockTokens).map((token) => token.symbol)
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedOrder))
    })

    it("sorts tokens in the predefined order", () => {
      const mockTokens = [
        getMockToken({ symbol: "LORDS" }),
        getMockToken({ symbol: "vSTRK" }),
        getMockToken({ symbol: "EKUBO" }),
        getMockToken({ symbol: "ZEND" }),
        getMockToken({ symbol: "USDC" }),
        getMockToken({ symbol: "DAI" }),
        getMockToken({ symbol: "LUSD" }),
      ]

      const expectedOrder = predefinedSortOrder.filter((symbol) =>
        mockTokens.some((token) => token.symbol === symbol),
      )

      const result = sortSwapTokens(mockTokens).map((token) => token.symbol)
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedOrder))
    })

    it("sorts tokens in alphabetial order", () => {
      const mockTokens = [
        getMockToken({ symbol: "XRP" }),
        getMockToken({ symbol: "BNB" }),
        getMockToken({ symbol: "SOL" }),
        getMockToken({ symbol: "DOGE" }),
        getMockToken({ symbol: "ADA" }),
        getMockToken({ symbol: "LTC" }),
        getMockToken({ symbol: "BTC" }),
      ]

      const expectedOrder = ["ADA", "BNB", "BTC", "DOGE", "LTC", "SOL", "XRP"]

      const result = sortSwapTokens(mockTokens).map((token) => token.symbol)
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedOrder))
    })

    it("handles an empty array", () => {
      expect(sortSwapTokens([])).toEqual([])
    })

    it("handles an array with a single token", () => {
      const singleTokenArray = [getMockToken({ symbol: "ETH" })]
      expect(sortSwapTokens(singleTokenArray)).toEqual(singleTokenArray)
    })
  })

  describe("getProvidersFromTradeRoute", () => {
    const mockAddress =
      "0x062bd02616B4d85040b0B7Af610923Aed51F4E8458201c19d94CEB6E30150372"

    it("should extract provider info from a simple route", () => {
      const route = {
        name: "Ekubo",
        dappId: "ekubo-123",
        percent: 100,
        sellToken: mockAddress,
        buyToken: mockAddress,
        routes: [],
      }

      const result = getProvidersFromTradeRoute(route)
      expect(result).toEqual([{ name: "Ekubo", dappId: "ekubo-123" }])
    })

    it("should handle nested routes", () => {
      const route = {
        name: "Aggregator",
        dappId: "agg-123",
        percent: 100,
        sellToken: mockAddress,
        buyToken: mockAddress,
        routes: [
          {
            name: "JediSwap",
            dappId: "jedi-123",
            percent: 60,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [],
          },
          {
            name: "MySwap",
            percent: 40,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [],
          },
        ],
      }

      const result = getProvidersFromTradeRoute(route)
      expect(result).toEqual([
        { name: "Aggregator", dappId: "agg-123" },
        { name: "JediSwap", dappId: "jedi-123" },
        { name: "MySwap" },
      ])
    })

    it("should keep entry with dappId when duplicate providers exist", () => {
      const route = {
        name: "Aggregator",
        percent: 100,
        sellToken: mockAddress,
        buyToken: mockAddress,
        routes: [
          {
            name: "JediSwap",
            dappId: "jedi-123",
            percent: 50,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [],
          },
          {
            name: "JediSwap",
            percent: 50,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [],
          },
        ],
      }

      const result = getProvidersFromTradeRoute(route)
      expect(result).toEqual([
        { name: "Aggregator" },
        { name: "JediSwap", dappId: "jedi-123" },
      ])
    })

    it("should handle deeply nested routes", () => {
      const route = {
        name: "Aggregator",
        dappId: "agg-123",
        percent: 100,
        sellToken: mockAddress,
        buyToken: mockAddress,
        routes: [
          {
            name: "JediSwap",
            percent: 60,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [
              {
                name: "MySwap",
                dappId: "my-123",
                percent: 100,
                sellToken: mockAddress,
                buyToken: mockAddress,
                routes: [],
              },
            ],
          },
          {
            name: "MySwap",
            percent: 40,
            sellToken: mockAddress,
            buyToken: mockAddress,
            routes: [],
          },
        ],
      }

      const result = getProvidersFromTradeRoute(route)
      expect(result).toEqual([
        { name: "Aggregator", dappId: "agg-123" },
        { name: "JediSwap" },
        { name: "MySwap", dappId: "my-123" },
      ])
    })

    it("should throw error for invalid route schema", () => {
      const invalidRoute = {
        name: "Invalid",
        // missing required fields
        routes: [],
      }

      expect(() => getProvidersFromTradeRoute(invalidRoute as any)).toThrow()
    })
  })
})
