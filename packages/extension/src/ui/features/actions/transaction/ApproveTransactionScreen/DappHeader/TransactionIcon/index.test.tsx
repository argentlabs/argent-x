import { render } from "@testing-library/react"

import * as transactionReviewService from "../../../../../../../shared/transactionReview.service"
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
  it("should render DeclareContractIcon if isDeclareContract is true", () => {
    const props: TransactionIconProps = {
      isDeclareContract: true,
    }

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("declare-contract-icon")).toBeInTheDocument()
  })

  it("should render SwapTransactionIcon if type is apiTransactionReviewActivityType.swap", () => {
    const props: TransactionIconProps = {
      isDeclareContract: false,
    }
    vi.spyOn(
      transactionReviewService,
      "getTransactionReviewWithType",
    ).mockImplementation(() =>
      vi.fn(() => {
        return {
          type: transactionReviewService.apiTransactionReviewActivityType.swap,
        } as transactionReviewService.TransactionReviewWithType
      })(),
    )

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("swap-transaction-icon")).toBeInTheDocument()
  })

  it("should render SendTransactionIcon if type is apiTransactionReviewActivityType.transfer", () => {
    vi.spyOn(
      transactionReviewService,
      "getTransactionReviewWithType",
    ).mockImplementation(() =>
      vi.fn(() => {
        return {
          type: transactionReviewService.apiTransactionReviewActivityType
            .transfer,
        } as transactionReviewService.TransactionReviewWithType
      })(),
    )
    const props: TransactionIconProps = {
      isDeclareContract: false,
    }

    const { queryByTestId } = render(<TransactionIcon {...props} />)
    expect(queryByTestId("send-transaction-icon")).toBeInTheDocument()
  })
})
