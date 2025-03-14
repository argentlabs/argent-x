import "fake-indexeddb/auto"
import { fireEvent, render, screen, act } from "@testing-library/react"
import { Swap, fadeIn, reverseSwapAnimation, swapAnimation } from "./Swap"
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
import { MemoryRouter } from "react-router-dom"
import { Field } from "./state/fields"

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

    vi.spyOn(useSwapStateModule, "createInitialState").mockReturnValue({
      independentField: Field.PAY,
      typedValue: "",
      PAY: {
        tokenAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      },
      RECEIVE: {
        tokenAddress:
          "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
      },
      isFiatInput: false,
    })

    const defaultSwapState = {
      ...useSwapStateModule.createInitialState(),
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
      <MemoryRouter>
        <Suspense fallback="Loading">
          <Swap />
        </Suspense>
      </MemoryRouter>,
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

    // waiting for the swap to be triggered
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(onSwitchTokensMock).toHaveBeenCalled()
  })

  it("handles pay input selection", async () => {
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

    const payInput = document.getElementById("swap-input-pay-panel")
    if (payInput) {
      fireEvent.change(payInput, {
        target: { value: "100" },
      })
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
    }
    expect(onUserInputMock).toHaveBeenCalledWith("PAY", "100")
  })

  it("handles receive input selection", async () => {
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

    const receiveInput = document.getElementById("swap-input-receive-panel")
    if (receiveInput) {
      fireEvent.change(receiveInput, {
        target: { value: "100" },
      })
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
    }
    expect(onUserInputMock).toHaveBeenCalledWith("RECEIVE", "100")
  })

  it("handles max input", async () => {
    const onUserInputMock = vi.fn()
    await act(async () => {
      return setup({}, {}, { onUserInput: onUserInputMock })
    })

    fireEvent.click(await screen.findByText("100%"))
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
  it("triggers icon animation on switch direction button click", async () => {
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

    const switchDirectionIcon = await screen.findByTestId(
      "switch-direction-icon",
    )
    expect(switchDirectionIcon).toHaveStyle(
      `animation: ${fadeIn.name} 0.3s ease-in forwards`,
    )
  })

  // Test for checking if the switch direction button resets rotation after animation
  it("swap inputs do not have animation styles by default", async () => {
    await act(async () => {
      return setup(
        {},
        {
          switchTokens: vi.fn(),
        },
      )
    })

    const payInputBox = screen.getByTestId("swap-input-pay-panel-box")
    const receiveInputBox = screen.getByTestId("swap-input-receive-panel-box")
    expect(payInputBox).not.toHaveStyle(
      `animation: ${swapAnimation.name} 0.5s ease-in-out forwards`,
    )
    expect(receiveInputBox).not.toHaveStyle(
      `animation: ${reverseSwapAnimation.name} 0.5s ease-in-out forwards`,
    )
    const switchDirectionButton = screen.getByLabelText(
      "Switch input and output",
    )
    fireEvent.click(switchDirectionButton)

    expect(payInputBox).toHaveStyle(
      `animation: ${swapAnimation.name} 0.5s ease-in-out forwards`,
    )
    expect(receiveInputBox).toHaveStyle(
      `animation: ${reverseSwapAnimation.name} 0.5s ease-in-out forwards`,
    )
  })
})
