import { constants } from "starknet"
import { getMockBaseToken, getMockToken } from "../../../../../test/token.mock"
import { ETH, USDC } from "../../../../shared/token/__new/constants"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import {
  bipsToPercent,
  isETH,
  maxAmountSpend,
  maxAmountSpendFromTokenBalance,
  predefinedSortOrder,
  sortSwapTokens,
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
})
