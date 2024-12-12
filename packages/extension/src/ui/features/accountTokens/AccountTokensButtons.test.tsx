/* eslint-disable @typescript-eslint/no-misused-promises */
import { fireEvent, render, screen } from "@testing-library/react"

import { getMockAccount } from "../../../../test/account.mock"
import type { AccountTokensButtonsProps } from "./AccountTokensButtons"
import { AccountTokensButtons } from "./AccountTokensButtons"

const mockProps = {
  account: getMockAccount({}),
  alertDialogIsOpen: true,
  title: "Alert",
  message: "This is an alert",
  accountIsDeployed: true,
  onCancel: vi.fn(),
  onAddFunds: vi.fn(),
  showAddFundsButton: true,
  showSendButton: true,
  onSend: vi.fn(),
  showHideMultisigButton: true,
  onHideMultisigModalOpen: vi.fn(),
  isHideMultisigModalOpen: true,
  onHideMultisigModalClose: vi.fn(),
  onHideConfirm: vi.fn(),
  buttonColumnCount: 3,
  hasNonZeroBalance: true,
  showSwapButton: false,
  onSwap: () => {},
} as AccountTokensButtonsProps

describe("AccountTokensButtons", async () => {
  it("renders the component with all buttons and triggers the appropriate actions", async () => {
    render(<AccountTokensButtons {...mockProps} />)

    // Add funds button
    const addFundsButton = screen.getByLabelText("Fund")
    expect(addFundsButton).toBeInTheDocument()
    fireEvent.click(addFundsButton)
    expect(mockProps.onAddFunds).toHaveBeenCalled()

    // Send button
    const sendButton = screen.getByLabelText("Send")
    expect(sendButton).toBeInTheDocument()
    fireEvent.click(sendButton)
    expect(mockProps.onSend).toHaveBeenCalled()

    // Hide account button
    const hideAccountButton = screen.getByLabelText("Hide")
    expect(hideAccountButton).toBeInTheDocument()
    fireEvent.click(hideAccountButton)
    expect(mockProps.onHideMultisigModalOpen).toHaveBeenCalled()
  })
})
