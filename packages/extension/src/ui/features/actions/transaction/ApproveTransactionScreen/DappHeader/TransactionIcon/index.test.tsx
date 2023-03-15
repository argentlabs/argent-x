import { render } from "@testing-library/react"

import * as transactionReviewService from "../../../../../../../shared/transactionReview.service"
import { ApproveScreenType } from "../../../types"
import { TransactionIcon, TransactionIconProps } from "."

vi.mock("../../../../../networks/useNetworks", () => {
  return {
    useCurrentNetwork: vi.fn(() => ({
      id: "1",
      name: "Mainnet",
    })),
  }
})

vi.mock("../../../useErc721Transfers", () => {
  return {
    useERC721Transfers: vi.fn(() => []),
  }
})

beforeAll(() => {
  vi.resetModules()
})

describe("TransactionIcon", () => {
  it("should render DeclareContractIcon if it's a declare transaction", () => {
    const props: TransactionIconProps = {
      approveScreenType: ApproveScreenType.DECLARE,
    }

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("declare-contract-icon")).toBeInTheDocument()
  })

  it("should render DeclareContractIcon if it's a deploy transaction", () => {
    const props: TransactionIconProps = {
      approveScreenType: ApproveScreenType.DEPLOY,
    }

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("declare-contract-icon")).toBeInTheDocument()
  })

  it("should render SendTransactionIcon if type is apiTransactionReviewActivityType.transfer", () => {
    vi.spyOn(
      transactionReviewService,
      "getTransactionReviewWithType",
    ).mockImplementation(() =>
      vi.fn(() => {
        return {
          type: "transfer",
        } as transactionReviewService.TransactionReviewWithType
      })(),
    )
    const props: TransactionIconProps = {
      approveScreenType: ApproveScreenType.TRANSACTION,
    }

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("send-transaction-icon")).toBeInTheDocument()
  })

  it("should render SwapTransactionIcon if type is apiTransactionReviewActivityType.swap", () => {
    const props: TransactionIconProps = {
      approveScreenType: ApproveScreenType.TRANSACTION,
    }

    vi.spyOn(
      transactionReviewService,
      "getTransactionReviewSwap",
    ).mockImplementation(() =>
      vi.fn(() => {
        return mockSwapTransactionReview as transactionReviewService.ApiTransactionReview
      })(),
    )

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("swap-transaction-icon")).toBeInTheDocument()
  })
})

const mockSwapTransactionReview = {
  assessment: "neutral",
  assessmentDetails: {
    contract_address:
      "0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
  },
  activity: {
    src: {
      token: {
        address:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        unknown: false,
        type: "ERC20",
      },
      amount: "16566181303571314",
      usd: 28.3,
      slippage: "equal",
    },
    dst: {
      token: {
        address:
          "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        unknown: false,
        type: "ERC20",
      },
      amount: "27763503",
      usd: 27.77,
      slippage: "at_least",
    },
    type: "swap",
  },
}
