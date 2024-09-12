import { renderHook, act } from "@testing-library/react"
import { useSwapCallback } from "./useSwapCallback"
import * as reactViews from "../../../views/implementation/react"
import * as swapServices from "../../../services/swap"
import { addressSchema } from "@argent/x-shared"
import { getMockTrade } from "../../../../../test/trade.mock"
import { sampleOrderResponse } from "../../../../shared/swap/service/order.mock"
import { stark } from "starknet"

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

  beforeEach(() => {
    vi.resetAllMocks() // Reset all mocks to their initial state

    vi.mocked(reactViews.useView).mockReturnValue(mockSelectedAccount)
    vi.mocked(swapServices.swapService.getSwapOrderFromTrade).mockResolvedValue(
      {
        calls: mockCalls,
      },
    )
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
    )
  })
})
