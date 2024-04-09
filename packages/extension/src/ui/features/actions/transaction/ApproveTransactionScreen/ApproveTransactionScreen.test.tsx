import { act, fireEvent, screen } from "@testing-library/react"
import { noop } from "lodash-es"
import { describe, expect, it } from "vitest"

import { delay } from "../../../../../shared/utils/delay"
import { renderWithLegacyProviders } from "../../../../test/utils"
import {
  accounts,
  aspect,
  jediswap,
  jediswapUnsafe,
  transfer,
  transferV3,
  transferWithWarnings,
} from "../../__fixtures__"
import { TransactionActionFixture } from "../../__fixtures__/types"
import { ApproveScreenType } from "../types"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"
import { TransactionType } from "starknet"
import userEvent from "@testing-library/user-event"

const renderWithProps = async (
  props: TransactionActionFixture &
    Pick<ApproveTransactionScreenProps, "onReject" | "onSubmit">,
) => {
  await act(async () => {
    renderWithLegacyProviders(
      <ApproveTransactionScreen
        actionHash="0x123"
        multisigModalDisclosure={{
          isOpen: false,
          onOpen: () => undefined,
          onClose: () => undefined,
          onToggle: () => undefined,
          isControlled: false,
          getButtonProps: () => undefined,
          getDisclosureProps: () => undefined,
        }}
        multisigBannerProps={{
          account: accounts[0],
          confirmations: 0,
          onClick: noop,
        }}
        showTransactionActions={false}
        hasBalanceChange={true}
        disableConfirm={false}
        isMainnet
        isSimulationLoading={false}
        hasPendingMultisigTransactions={false}
        selectedAccount={accounts[0]}
        approveScreenType={ApproveScreenType.TRANSACTION}
        transactionAction={{
          type: TransactionType.INVOKE,
          payload: props.transactions,
        }}
        setShowTxDetails={() => undefined}
        showTxDetails={false}
        {...props}
      />,
    )
    await delay(0) /** allow state change to propagate */
  })
}

describe("ApproveTransactionScreen", () => {
  it("should render jediswap scenario as expected", async () => {
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...jediswap,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: jediswap.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(screen.getByText(/Confirm/)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/jediswap.xyz/)).toBeInTheDocument()
    expect(screen.getByText(/Estimated balance change/)).toBeInTheDocument()
    expect(screen.getByText(/USD Coin/)).toBeInTheDocument()
    expect(screen.getByText(/\+0.0148 USDC/)).toBeInTheDocument()
    expect(screen.getByText(/Swap exact tokens for tokens/)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Cancel"))
    expect(onReject).toHaveBeenCalled()
    fireEvent.click(screen.getByText("Confirm"))
    expect(onSubmit).toHaveBeenCalled()
  })
  it("should render jediswapUnsafe scenario as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...jediswapUnsafe,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: jediswap.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(
      screen.getByText(/Warning: Approved spending limit/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        / spend more tokens than you’re using in this transaction/,
      ),
    ).toBeInTheDocument()
  })
  it("should render transfer scenario as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transfer,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: transfer.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(screen.getByText(/Balance change/)).toBeInTheDocument()

    expect(screen.getByText("-0.001 ETH")).toBeInTheDocument()
  })
  it("should render transfer v3 scenario as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transferV3,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: transferV3.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(screen.getByText(/Balance change/)).toBeInTheDocument()
    expect(screen.getByText("-0.001 ETH")).toBeInTheDocument()
  })
  it("should render aspect scenario as expected", async () => {
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...aspect,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: aspect.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(screen.getByText(/Unknown NFT/)).toBeInTheDocument()
    expect(screen.getByText(/\+1 NFT/)).toBeInTheDocument()
  })
  it("should render warning for transfer", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transferWithWarnings,
      transactionActionsType: {
        type: "INVOKE_FUNCTION",
        payload: transferWithWarnings.transactions,
      },
      onReject,
      onSubmit,
    })
    expect(screen.getByText(/Caution/)).toBeInTheDocument()
    expect(
      screen.getByText(/Sending to the correct account?/),
    ).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument()

    const actionsAccordion = screen.getByTestId(
      "transaction-review-action-ERC20_transfer",
    )
    expect(actionsAccordion).toBeInTheDocument()

    await userEvent.click(actionsAccordion)

    expect(screen.getByText("Erc 20 transfer amount")).toBeInTheDocument()
    expect(screen.getByText("0.0001 ETH")).toBeInTheDocument()

    expect(screen.getByText("Erc 20 transfer recipient")).toBeInTheDocument()
    expect(screen.getAllByText(/0x0014…5911/)).toHaveLength(2)
  })
})
