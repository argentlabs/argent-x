import { describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { usePriceImpact } from "./usePriceImpact"
import type { Trade } from "../../../../shared/swap/model/trade.model"

vi.mock("../../accountTokens/tokenPriceHooks", () => ({
  useTokenAmountToCurrencyFormatted: vi.fn((amount) => {
    if (!amount) return undefined
    return amount // Return the amount as-is for testing purposes
  }),
}))

describe("usePriceImpact", () => {
  it("should return undefined when trade is undefined", () => {
    const { result } = renderHook(() => usePriceImpact(undefined))
    expect(result.current).toBeUndefined()
  })

  it("should return undefined when trade amounts are undefined", () => {
    const trade = {
      payAmount: undefined,
      receiveAmount: undefined,
      payToken: undefined,
      receiveToken: undefined,
    } as unknown as Trade
    const { result } = renderHook(() => usePriceImpact(trade))
    expect(result.current).toBeUndefined()
  })

  it("should return 'low' impact when price impact is <= 5%", () => {
    const trade: Trade = {
      payAmount: "100",
      receiveAmount: "96",
      payToken: { decimals: 18 },
      receiveToken: { decimals: 18 },
    } as Trade

    const { result } = renderHook(() => usePriceImpact(trade))
    expect(result.current).toEqual({
      value: 4,
      type: "low",
    })
  })

  it("should return 'high' impact when price impact is > 5% and < 20%", () => {
    const trade: Trade = {
      payAmount: "100",
      receiveAmount: "90",
      payToken: { decimals: 18 },
      receiveToken: { decimals: 18 },
    } as Trade

    const { result } = renderHook(() => usePriceImpact(trade))
    expect(result.current).toEqual({
      value: 10,
      type: "high",
    })
  })

  it("should return 'extreme' impact when price impact is >= 20%", () => {
    const trade: Trade = {
      payAmount: "100",
      receiveAmount: "75",
      payToken: { decimals: 18 },
      receiveToken: { decimals: 18 },
    } as Trade

    const { result } = renderHook(() => usePriceImpact(trade))
    expect(result.current).toEqual({
      value: 25,
      type: "extreme",
    })
  })
})
