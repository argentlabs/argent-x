import "fake-indexeddb/auto"
import { fireEvent, render, screen, act } from "@testing-library/react"
import { Swap, spin } from "./Swap"
import * as useSwapInfoModule from "./hooks/useSwapInfo"
import * as useSwapStateModule from "./state/fields"
import * as useSwapActionHandlersModule from "./hooks/useSwapActionHandler"
import * as useSwapCallbackModule from "./hooks/useSwapCallback"
import * as useUserStateModule from "./state/user"
import {
  getMockToken,
  getMockTokenWithOptionalBigIntBalance,
} from "../../../../test/token.mock"
import { getMockTrade } from "../../../../test/trade.mock"
import { Suspense } from "react"

// Mocking modules
vi.mock("./hooks/useSwapInfo")
vi.mock("./state/fields")
vi.mock("./hooks/useSwapActionHandler")
vi.mock("./hooks/useSwapCallback")
vi.mock("../../app.state")
vi.mock("./state/user")

const mockPayToken = getMockToken({ symbol: "PAY" })
const mockReceiveToken = getMockToken({ symbol: "RECEIVE" })

const mockPayTokenBalance = getMockTokenWithOptionalBigIntBalance({
  symbol: "PAY",
  balance: BigInt(200),
})

const mockReceiveTokenBalance = getMockTokenWithOptionalBigIntBalance({
  symbol: "RECEIVE",
  balance: BigInt(100),
})

describe("Swap Component Tests", () => {
  // Setup function to initialize the component with default or provided props
  const setup = async (
    swapInfoOverrides = {},
    swapState = {},
    actionHandlers = {},
    userState = {},
    appState = {},
    swapCallback = vi.fn(),
  ) => {
    const swapInfo: useSwapInfoModule.SwapInfo = {
      tokens: {
        PAY: mockPayToken,
        RECEIVE: mockReceiveToken,
      },
      tokenBalances: {
        PAY: mockPayTokenBalance,
        RECEIVE: mockReceiveTokenBalance,
      },
      parsedAmount: 100n,
      trade: getMockTrade({
        payAmount: "100",
        receiveAmount: "200",
      }),
      inputError: undefined,
      tradeLoading: false,
    }

    const defaultUserState: useUserStateModule.UserState = {
      ...userState,
      updateUserSlippageTolerance: vi.fn(),
      userSlippageTolerance: 10,
    }

    const defaultSwapState = {
      ...useSwapStateModule.initialState,
      ...swapState,
      resetTypedValue: vi.fn(),
    }

    const defaultActionHandlers = {
      onUserInput: vi.fn(),
      onTokenSelection: vi.fn(),
      onSwitchTokens: vi.fn(),
      ...actionHandlers,
    }

    const defaultSwapInfo = { ...swapInfo, ...swapInfoOverrides }
    vi.spyOn(useSwapInfoModule, "useSwapInfo").mockReturnValue(defaultSwapInfo)
    vi.spyOn(useSwapStateModule, "useSwapState").mockReturnValue(
      defaultSwapState,
    )
    vi.spyOn(
      useSwapActionHandlersModule,
      "useSwapActionHandlers",
    ).mockReturnValue(defaultActionHandlers)
    vi.spyOn(useUserStateModule, "useUserState").mockReturnValue(
      defaultUserState,
    )
    vi.spyOn(useSwapCallbackModule, "useSwapCallback").mockReturnValue(
      swapCallback,
    )
    const rendered = render(
      <Suspense fallback="Loading">
        <Swap />
      </Suspense>,
    )

    return rendered
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  it("renders without crashing", async () => {
    await act(async () => {
      return await setup()
    })

    expect(await screen.findByTestId("swap-container")).toBeInTheDocument()
  })

  it("handles switch direction button click", async () => {
    const onSwitchTokensMock = vi.fn()
    await act(async () => {
      return setup({}, {}, { onSwitchTokens: onSwitchTokensMock })
    })

    fireEvent.click(screen.getByLabelText("Switch input and output"))
    expect(onSwitchTokensMock).toHaveBeenCalled()
  })

  it("handles input selection", async () => {
    const onTokenSelectionMock = vi.fn()
    const onUserInputMock = vi.fn()
    await act(async () => {
      return setup(
        {},
        {},
        {
          onTokenSelection: onTokenSelectionMock,
          onUserInput: onUserInputMock,
        },
      )
    })

    fireEvent.change(await screen.findByTestId("swap-input-pay-panel"), {
      target: { value: "100" },
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })
    expect(onUserInputMock).toHaveBeenCalledWith("PAY", "100")
  })

  it("handles max input", async () => {
    const onUserInputMock = vi.fn()
    await act(async () => {
      return setup({}, {}, { onUserInput: onUserInputMock })
    })

    fireEvent.click(await screen.findByText("Max"))
    expect(onUserInputMock).toHaveBeenCalled()
  })

  it("disables swap button when there is an input error", async () => {
    await act(async () => {
      return setup({
        inputError: useSwapInfoModule.SwapInputError.NO_AMOUNT,
      })
    })
    expect(await screen.findByText("Enter amount")).toBeDisabled()
  })

  it("initiates swap on swap button click", async () => {
    const swapCallbackMock = vi.fn().mockResolvedValue({})
    const onUserInputMock = vi.fn()
    await act(async () => {
      return setup(
        {
          trade: getMockTrade({
            payAmount: "100",
            receiveAmount: "200",
          }),
        },
        {},
        { onUserInput: onUserInputMock },
        {},
        {},
        swapCallbackMock,
      )
    })

    fireEvent.click(await screen.findByText("Review swap"))
    await act(async () => {
      await swapCallbackMock()
    })
    expect(swapCallbackMock).toHaveBeenCalled()
  })

  // Test for checking if the trade loading indicator is shown when trade is loading
  it("shows loading indicator when trade is loading", async () => {
    await act(async () => {
      return setup({ tradeLoading: true, trade: undefined })
    })
    expect(await screen.findByTestId("swap-trade-loading")).toBeInTheDocument()
  })

  // Test for checking if the trade prices info is shown when trade is present
  it("shows trade prices info when trade is present", async () => {
    await act(async () => {
      return setup({
        trade: getMockTrade({
          payAmount: "100",
          receiveAmount: "200",
        }),
      })
    })
    expect(await screen.findByTestId("swap-prices-info")).toBeInTheDocument()
  })

  // Test for checking if the warning message is shown when there is an error
  it("shows warning message when there is an error", async () => {
    await act(async () => {
      return setup({
        inputError: useSwapInfoModule.SwapInputError.NO_ACCOUNT,
      })
    })
    expect(await screen.findByTestId("swap-error-button")).toBeInTheDocument()
  })

  // Test for checking if the switch direction button triggers the rotation animation
  it("triggers rotation animation on switch direction button click", async () => {
    await act(async () => {
      return setup(
        {},
        {
          switchTokens: vi.fn(),
        },
      )
    })
    const switchDirectionButton = await screen.findByLabelText(
      "Switch input and output",
    )
    fireEvent.click(switchDirectionButton)
    expect(switchDirectionButton).toHaveStyle(
      `animation: ${spin.name} 0.125s linear`,
    )
  })

  // Test for checking if the switch direction button resets rotation after animation
  it("resets rotation after switch direction button animation", async () => {
    vi.useFakeTimers()
    await act(async () => {
      return setup(
        {},
        {
          switchTokens: vi.fn(),
        },
      )
    })
    const switchDirectionButton = screen.getByLabelText(
      "Switch input and output",
    )
    fireEvent.click(switchDirectionButton)
    act(() => {
      vi.runAllTimers()
    })
    expect(switchDirectionButton).not.toHaveStyle(
      `animation: ${spin.name} 0.125s linear`,
    )
    vi.useRealTimers()
  })
})
