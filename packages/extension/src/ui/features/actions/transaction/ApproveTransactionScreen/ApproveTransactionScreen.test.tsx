import "fake-indexeddb/auto"

import { act, screen } from "@testing-library/react"
import { noop } from "lodash-es"
import { describe, expect, it } from "vitest"

import userEvent from "@testing-library/user-event"
import { TransactionType } from "starknet"
import { delay } from "../../../../../shared/utils/delay"
import { renderWithLegacyProviders } from "../../../../test/utils"
import {
  accounts,
  aspect,
  transfer,
  transferV3,
  transferWithWarnings,
} from "../../__fixtures__"
import type { TransactionActionFixture } from "../../__fixtures__/types"
import * as txReviewUtils from "../../warning/helper"
import { ApproveScreenType } from "../types"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import type { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"
import type { ITransactionReviewWarning } from "@argent/x-shared"

vi.mock("../../hooks/useActionScreen", () => ({
  useActionScreen: vi.fn().mockReturnValue({
    action: {
      meta: {
        origin: "origin",
        title: "Transaction title",
        subtitle: "Transaction subtitle",
        icon: "InfoIcon",
      },
    },
  }),
}))

const renderWithProps = async (
  props: TransactionActionFixture &
    Pick<ApproveTransactionScreenProps, "onReject" | "onSubmit">,
) => {
  await act(async () => {
    renderWithLegacyProviders(
      <ApproveTransactionScreen
        actionHash="0x123"
        multisigBannerProps={{
          account: accounts[0],
          confirmations: 0,
          onClick: noop,
        }}
        disableConfirm={false}
        isMainnet
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
  it("should render transfer scenario as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transfer,
      onReject,
      onSubmit,
    })

    expect(await screen.findByText(/Unknown token/)).toBeInTheDocument()
  })
  it("should render transfer v3 scenario as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transferV3,
      onReject,
      onSubmit,
    })
    expect(await screen.findByText("0.0001 ETH")).toBeInTheDocument()
  })
  it("should render aspect scenario as expected", async () => {
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...aspect,
      onReject,
      onSubmit,
    })
    expect(await screen.findByText(/Xplorer/)).toBeInTheDocument()
    expect(await screen.findByText(/\+1 NFT/)).toBeInTheDocument()
  })
  it("should render warning for transfer", async () => {
    const warningsInStore = {
      reason: "undeployed_account",
      title: "Sending to the correct account?",
      severity: "caution",
      description:
        "The account you are sending to hasn't done any transactions, please double check the address",
    } as ITransactionReviewWarning

    vi.mock("../../warning/helper", () => ({
      useWarningsByReason: vi.fn(),
      getHighestSeverity: vi.fn(),
      useWarningsTitle: vi.fn(),
    }))
    vi.mocked(txReviewUtils.useWarningsByReason).mockReturnValue(
      warningsInStore,
    )

    vi.mocked(txReviewUtils.useWarningsTitle).mockReturnValue(
      "Sending to the correct account?",
    )

    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transferWithWarnings,
      onReject,
      onSubmit,
    })
    expect(await screen.findByText(/Caution/)).toBeInTheDocument()
    expect(
      await screen.findByText(/Sending to the correct account?/),
    ).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument()

    const actionsAccordion = screen.getByTestId(
      "transaction-review-action-ERC20_transfer",
    )
    expect(actionsAccordion).toBeInTheDocument()

    await userEvent.click(actionsAccordion)

    expect(
      await screen.findByText("Erc 20 transfer amount"),
    ).toBeInTheDocument()
    expect(await screen.findByText("0.0001 ETH")).toBeInTheDocument()

    expect(
      await screen.getByText("Erc 20 transfer recipient"),
    ).toBeInTheDocument()
    expect(await screen.findAllByText(/0x0014…5911/)).toHaveLength(1)
  })
  it("should render transaction header as expected", async () => {
    window.scrollTo = vi.fn(noop)
    const onReject = vi.fn()
    const onSubmit = vi.fn()
    await renderWithProps({
      ...transfer,
      onReject,
      onSubmit,
    })

    expect(await screen.findByText(/Transaction title/)).toBeInTheDocument()
    expect(await screen.findByText(/Transaction subtitle/)).toBeInTheDocument()
  })
})
