import { addressSchema } from "@argent/x-shared"
import { act, renderHook } from "@testing-library/react"
import { stark } from "starknet"
import { getMockTrade } from "../../../../../test/trade.mock"
import { sampleOrderResponse } from "../../../../shared/swap/service/order.mock"
import * as swapServices from "../../../services/swap"
import * as reactViews from "../../../views/implementation/react"
import * as usePriceImpact from "./usePriceImpact"
import { useSwapCallback } from "./useSwapCallback"
import * as useSwapTradeProviders from "./useSwapTradeProviders"

vi.mock("../../../views/implementation/react", () => ({
  useView: vi.fn(),
}))

vi.mock("../../../services/swap", () => ({
  swapService: {
    getSwapOrderFromTrade: vi.fn(),
    makeSwap: vi.fn(),
  },
}))

describe("useSwapCallback", () => {
  const mockTrade = getMockTrade()
  const mockParsedAddress = addressSchema.parse(stark.randomAddress())
  const mockSelectedAccount = { address: mockParsedAddress }
  const mockCalls = sampleOrderResponse.calls
  const mockPriceImpact = {
    value: 0.5,
    type: "low" as const,
  }
  const mockTradeProviders = [{ name: "AVNU", iconUrl: "logo-url" }]

  beforeEach(() => {
    vi.resetAllMocks() // Reset all mocks to their initial state

    vi.mocked(reactViews.useView).mockReturnValue(mockSelectedAccount)
    vi.mocked(swapServices.swapService.getSwapOrderFromTrade).mockResolvedValue(
      {
        calls: mockCalls,
      },
    )
    vi.spyOn(useSwapTradeProviders, "useSwapTradeProviders").mockReturnValue(
      mockTradeProviders,
    )

    vi.spyOn(usePriceImpact, "usePriceImpact").mockReturnValue(mockPriceImpact)
  })

  it("should return a handleSwap function", () => {
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    expect(typeof result.current).toBe("function")
  })

  it("should not execute swap if trade, userSlippageTolerance, or selectedAccount is missing", async () => {
    const { result } = renderHook(() => useSwapCallback(undefined, undefined))
    await act(async () => {
      await result.current()
    })
    expect(
      swapServices.swapService.getSwapOrderFromTrade,
    ).not.toHaveBeenCalled()
    expect(swapServices.swapService.makeSwap).not.toHaveBeenCalled()
  })

  it("should execute swap when trade, userSlippageTolerance, and selectedAccount are provided", async () => {
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    await act(async () => {
      await result.current()
    })
    expect(swapServices.swapService.getSwapOrderFromTrade).toHaveBeenCalledWith(
      mockParsedAddress,
      mockTrade,
      0.01,
    )
    expect(swapServices.swapService.makeSwap).toHaveBeenCalledWith(
      mockCalls,
      "Swap ETH to DAI",
      [
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
      ],
      {
        executionPrice: "1 ETH ≈ 1 DAI",
        priceImpact: mockPriceImpact,
        providers: mockTradeProviders,
        slippage: 0.01,
        totalFeePercentage: 0.0002,
        quoteToken: {
          address:
            "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
          decimals: 18,
          name: "Dai Stablecoin",
          networkId: "mainnet-alpha",
          symbol: "DAI",
        },
        baseToken: {
          address:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          decimals: 18,
          name: "Ether",
          networkId: "mainnet-alpha",
          symbol: "ETH",
        },
      },
    )
  })

  it("should execute swap with review trade information", async () => {
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    await act(async () => {
      await result.current()
    })

    const expectedReviewTrade = {
      providers: mockTradeProviders,
      executionPrice: "1 ETH ≈ 1 DAI",
      slippage: 0.01,
      totalFeePercentage: mockTrade.totalFeePercentage,
      priceImpact: mockPriceImpact,
      quoteToken: {
        address:
          "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
        decimals: 18,
        name: "Dai Stablecoin",
        networkId: "mainnet-alpha",
        symbol: "DAI",
      },
      baseToken: {
        address:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        decimals: 18,
        name: "Ether",
        networkId: "mainnet-alpha",
        symbol: "ETH",
      },
    }

    expect(swapServices.swapService.makeSwap).toHaveBeenCalledWith(
      mockCalls,
      "Swap ETH to DAI",
      [
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
      ],
      expectedReviewTrade,
    )
  })

  // Additional tests within the describe('useSwapCallback', () => { ... }) block

  it("should throw an error if getSwapOrderFromTrade fails", async () => {
    vi.mocked(swapServices.swapService.getSwapOrderFromTrade).mockRejectedValue(
      new Error("Failed to get swap order"),
    )
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    let error: any
    await act(async () => {
      try {
        await result.current()
      } catch (e) {
        error = e
      }
    })
    expect(error).toBeDefined()
    expect(error?.message).toBe("Failed to get swap order")
    expect(swapServices.swapService.makeSwap).not.toHaveBeenCalled()
  })

  it("should throw an error if executeTransaction fails", async () => {
    vi.mocked(swapServices.swapService.makeSwap).mockRejectedValue(
      new Error("Transaction failed"),
    )
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    let error: any
    await act(async () => {
      try {
        await result.current()
      } catch (e) {
        error = e
      }
    })
    expect(error).toBeDefined()
    expect(error.message).toBe("Transaction failed")
  })

  it("should handle the case when selectedAccount is null", async () => {
    vi.mocked(reactViews.useView).mockReturnValue(null)
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0.01))
    await act(async () => {
      await result.current()
    })
    expect(
      swapServices.swapService.getSwapOrderFromTrade,
    ).not.toHaveBeenCalled()
    expect(swapServices.swapService.makeSwap).not.toHaveBeenCalled()
  })

  it("should handle the case when userSlippageTolerance is zero", async () => {
    const { result } = renderHook(() => useSwapCallback(mockTrade, 0))
    await act(async () => {
      await result.current()
    })
    expect(swapServices.swapService.getSwapOrderFromTrade).toHaveBeenCalledWith(
      mockParsedAddress,
      mockTrade,
      0,
    )
    expect(swapServices.swapService.makeSwap).toHaveBeenCalledWith(
      mockCalls,
      "Swap ETH to DAI",
      [
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
      ],
      {
        executionPrice: "1 ETH ≈ 1 DAI",
        priceImpact: mockPriceImpact,
        providers: mockTradeProviders,
        slippage: 0,
        totalFeePercentage: 0.0002,
        quoteToken: {
          address:
            "0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
          decimals: 18,
          name: "Dai Stablecoin",
          networkId: "mainnet-alpha",
          symbol: "DAI",
        },
        baseToken: {
          address:
            "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          decimals: 18,
          name: "Ether",
          networkId: "mainnet-alpha",
          symbol: "ETH",
        },
      },
    )
  })
})
