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
} from "../../__fixtures__"
import { TransactionActionFixture } from "../../__fixtures__/types"
import { ApproveScreenType } from "../types"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { getDisplayWarnAndReasonForTransactionReview } from "../../../../../shared/transactionReview.service"
import { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"

/**
 * @vitest-environment jsdom
 */

const renderWithProps = async (
  props: TransactionActionFixture &
    Pick<ApproveTransactionScreenProps, "onReject" | "onSubmit">,
) => {
  const assessment = getDisplayWarnAndReasonForTransactionReview(
    props.transactionReview,
  )

  await act(async () => {
    renderWithLegacyProviders(
      <ApproveTransactionScreen
        multisigModalDisclosure={{
          isOpen: false,
          onOpen: () => undefined,
          onClose: () => undefined,
          onToggle: () => undefined,
          isControlled: false,
          getButtonProps: () => undefined,
          getDisclosureProps: () => undefined,
        }}
        showFraudMonitorBanner={true}
        multisigBannerProps={{
          account: accounts[0],
          confirmations: 0,
          onClick: noop,
        }}
        hasBalanceChange={true}
        showTransactionActions={true}
        assessmentReason={assessment.reason}
        disableConfirm={false}
        isMainnet
        isSimulationLoading={false}
        hasPendingMultisigTransactions={false}
        selectedAccount={accounts[0]}
        approveScreenType={ApproveScreenType.TRANSACTION}
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

    expect(screen.getByText(/Verified/)).toBeInTheDocument()
    expect(screen.getByText(/Confirm transactions/)).toBeInTheDocument()
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
        payload: jediswap.transactions,
      },
      onReject,
      onSubmit,
    })

    expect(
      screen.getByText(/This transaction has been flagged as dangerous/),
    ).toBeInTheDocument()
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
})
