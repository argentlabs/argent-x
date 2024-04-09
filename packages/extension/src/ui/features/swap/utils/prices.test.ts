import {
  formatExecutionPrice,
  getExecutionPrice,
  minimumAmountOutFromTrade,
  maximumAmountInForTrade,
} from "./prices"
import { getMockTrade } from "../../../../../test/trade.mock"
import { getMockToken } from "../../../../../test/token.mock"
import { Trade, TradeType } from "../../../../shared/swap/model/trade.model"
import { bigDecimal } from "@argent/x-shared"

describe("prices utils", () => {
  describe("formatExecutionPriceWithFee", () => {
    const mockTrade = getMockTrade({
      payAmount: "500000000000000000",
      receiveAmount: "1000000000000000000",
      payToken: getMockToken({ symbol: "ETH" }),
      receiveToken: getMockToken({ symbol: "DAI" }),
      totalFee: "485264460032841",
      totalFeeInCurrency: "0.0004839",
      totalFeePercentage: 0.0002,
    })

    it("should return an empty string if trade is not provided", () => {
      expect(formatExecutionPrice({ trade: undefined })).toBe("")
    })

    it("should return the correct execution price (with fees) without inversion", () => {
      const result = formatExecutionPrice({
        trade: mockTrade,
        includeFee: true,
        inverted: false,
      })
      expect(result).toEqual("1 ETH ~ 2.0019 DAI")
    })

    it("should return the correct execution price (with fees) with inversion", () => {
      const result = formatExecutionPrice({
        trade: mockTrade,
        includeFee: true,
        inverted: true,
      })
      expect(result).toEqual("1 DAI ~ 0.4995 ETH")
    })

    it("should return the correct execution price (without fees) without inversion", () => {
      const result = formatExecutionPrice({
        trade: mockTrade,
        includeFee: false,
        inverted: false,
      })
      expect(result).toEqual("1 ETH ~ 2.0 DAI")
    })

    it("should return the correct execution price (without fees)  with inversion", () => {
      const result = formatExecutionPrice({
        trade: mockTrade,
        includeFee: false,
        inverted: true,
      })
      expect(result).toEqual("1 DAI ~ 0.5 ETH")
    })

    it("should handle custom separators", () => {
      const separator = ":"
      const result = formatExecutionPrice({
        trade: mockTrade,
        includeFee: true,
        inverted: false,
        separator: separator,
      })
      expect(result).toContain(`1 ETH ${separator}`)
    })

    // Edge case: Trade with zero amounts
    it("should handle trades with zero amounts", () => {
      const zeroTrade: Trade = {
        ...mockTrade,
        payAmount: "0",
        receiveAmount: "0",
        totalFee: "0",
      }
      expect(() => formatExecutionPrice({ trade: zeroTrade })).toThrow()
    })

    // Edge case: Trade with very large amounts
    it("should handle trades with very large amounts", () => {
      const largeTrade: Trade = {
        ...mockTrade,
        payAmount: "1000000000000000000000000000",
        receiveAmount: "5000000000000000000000000000",
      }
      const result = formatExecutionPrice({ trade: largeTrade })
      expect(result).toContain(`1 ETH ~`)
      expect(result).toContain(`DAI`)
    })
  })

  describe("getExecutionPrice", () => {
    it("should return the correct execution price", () => {
      const numerator = { value: 1n, decimals: 0 }
      const denominator = { value: 2n, decimals: 0 }
      const executionPrice = getExecutionPrice(numerator, denominator)
      expect(executionPrice.value).toBe(0n)
      expect(executionPrice.decimals).toBe(0)
    })

    // Edge case: Division by zero
    it("should handle division by zero", () => {
      const numerator = { value: 1n, decimals: 0 }
      const denominator = { value: 0n, decimals: 0 }
      expect(() => getExecutionPrice(numerator, denominator)).toThrow()
    })

    // Edge case: Very large numbers
    it("should handle very large numbers", () => {
      const numerator = {
        value: 1000000000000000000000000000n,
        decimals: 18,
      }
      const denominator = { value: 1000000000000000000n, decimals: 18 }
      const executionPrice = getExecutionPrice(numerator, denominator)
      expect(executionPrice.value).toBe(1000000000000000000000000000n)
      expect(executionPrice.decimals).toBe(18)
    })
  })

  describe("minimumAmountOutFromTrade", () => {
    it("should calculate the minimum amount out correctly with normal slippage", () => {
      const trade = getMockTrade({
        receiveAmount: "1000000",
      })
      const slippage = 100 // 1%
      const minimumAmount = minimumAmountOutFromTrade(trade, slippage)
      const expectedValue = 990099n
      expect(minimumAmount.value).toBe(expectedValue)
      expect(minimumAmount.decimals).toBe(trade.receiveToken.decimals)
    })

    it("should handle zero slippage", () => {
      const trade = getMockTrade({
        receiveAmount: "1000000",
      })
      const slippage = 0
      const minimumAmount = minimumAmountOutFromTrade(trade, slippage)
      expect(minimumAmount.value).toBe(BigInt(trade.receiveAmount))
      expect(minimumAmount.decimals).toBe(trade.receiveToken.decimals)
    })

    it("should handle very high slippage", () => {
      const trade = getMockTrade({
        receiveAmount: "1000000",
      })
      const slippage = 10000 // 100%
      const minimumAmount = minimumAmountOutFromTrade(trade, slippage)
      const expectedValue = BigInt(trade.receiveAmount) / 2n // As slippage is 100%, the output is halved
      expect(minimumAmount.value).toBe(expectedValue)
      expect(minimumAmount.decimals).toBe(trade.receiveToken.decimals)
    })

    it("should handle slippage greater than 100%", () => {
      const trade = getMockTrade({
        receiveAmount: "1000000",
      })
      const slippage = 20000 // 200%
      const minimumAmount = minimumAmountOutFromTrade(trade, slippage)
      const expectedValue = BigInt(trade.receiveAmount) / 3n // As slippage is 200%, the output is a third
      expect(minimumAmount.value).toBe(expectedValue)
      expect(minimumAmount.decimals).toBe(trade.receiveToken.decimals)
    })

    it("should return the correct minimum amount when receiveAmount is a very large number", () => {
      const trade = getMockTrade({
        receiveAmount: "1000000000000000000000", // A very large number
      })
      const slippage = 100 // 1%
      const minimumAmount = minimumAmountOutFromTrade(trade, slippage)
      const expectedValue = 990099009900990099009n
      expect(minimumAmount.value).toBe(expectedValue)
      expect(minimumAmount.decimals).toBe(trade.receiveToken.decimals)
    })
  })

  describe("maximumAmountInForTrade", () => {
    const mockTrade: Trade = getMockTrade({
      payAmount: "1000000",
      payToken: getMockToken({ symbol: "TOKEN", decimals: 18 }),
      tradeType: TradeType.EXACT_PAY,
    })

    const mockNonExactPayTrade: Trade = {
      ...mockTrade,
      tradeType: TradeType.EXACT_RECEIVE,
    }

    it("returns the input amount for an EXACT_PAY trade type without slippage", () => {
      const result = maximumAmountInForTrade(mockTrade, 0)
      expect(result.value).toBe(BigInt(mockTrade.payAmount))
      expect(result.decimals).toBe(mockTrade.payToken.decimals)
    })

    it("calculates the maximum amount in with slippage for a non-EXACT_PAY trade type", () => {
      const slippage = 100 // 1%
      const result = maximumAmountInForTrade(mockNonExactPayTrade, slippage)
      const slippageInPercent = bigDecimal.div(
        { value: BigInt(slippage), decimals: 2 },
        { value: BigInt(10000), decimals: 2 },
      )
      const expectedValue = bigDecimal.mul(
        {
          value: BigInt(mockTrade.payAmount),
          decimals: mockTrade.payToken.decimals,
        },
        bigDecimal.add(bigDecimal.ONE, slippageInPercent),
      )
      expect(result.value).toBe(expectedValue.value)
      expect(result.decimals).toBe(expectedValue.decimals)
    })

    it("handles zero slippage for a non-EXACT_PAY trade type", () => {
      const result = maximumAmountInForTrade(mockNonExactPayTrade, 0)
      // When slippage is zero, the expected value should be the original payAmount
      const expectedValue = {
        value: BigInt(mockNonExactPayTrade.payAmount),
        decimals: mockNonExactPayTrade.payToken.decimals,
      }
      expect(result.value).toBe(expectedValue.value)
      expect(result.decimals).toBe(expectedValue.decimals)
    })

    it("handles very high slippage for a non-EXACT_PAY trade type", () => {
      const slippage = 10000 // 100%
      const result = maximumAmountInForTrade(mockNonExactPayTrade, slippage)
      const slippageInPercent = bigDecimal.div(
        { value: BigInt(slippage), decimals: 2 },
        { value: BigInt(10000), decimals: 2 },
      )
      const expectedValue = bigDecimal.mul(
        {
          value: BigInt(mockNonExactPayTrade.payAmount),
          decimals: mockNonExactPayTrade.payToken.decimals,
        },
        {
          ...bigDecimal.add(bigDecimal.ONE, slippageInPercent),
        },
      )
      expect(result.value).toBe(expectedValue.value)
      expect(result.decimals).toBe(expectedValue.decimals)
    })

    it("handles slippage greater than 100% for a non-EXACT_PAY trade type", () => {
      const slippage = 20000 // 200%
      const result = maximumAmountInForTrade(mockNonExactPayTrade, slippage)
      const slippageInPercent = bigDecimal.div(
        { value: BigInt(slippage), decimals: 2 },
        { value: BigInt(10000), decimals: 2 },
      )
      const expectedValue = bigDecimal.mul(
        {
          value: BigInt(mockNonExactPayTrade.payAmount),
          decimals: mockNonExactPayTrade.payToken.decimals,
        },
        {
          ...bigDecimal.add(bigDecimal.ONE, slippageInPercent),
        },
      )
      expect(result.value).toBe(expectedValue.value)
      expect(result.decimals).toBe(expectedValue.decimals)
    })

    it("handles negative slippage as zero slippage for a non-EXACT_PAY trade type", () => {
      const result = maximumAmountInForTrade(mockNonExactPayTrade, -100)
      const expectedValue = {
        value: BigInt(mockNonExactPayTrade.payAmount),
        decimals: mockNonExactPayTrade.payToken.decimals,
      }
      expect(result.value).toBe(expectedValue.value)
      expect(result.decimals).toBe(expectedValue.decimals)
    })
  })
})
