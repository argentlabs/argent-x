/* eslint-disable @typescript-eslint/no-misused-promises */
import { fireEvent, render, screen } from "@testing-library/react"

import { getMockAccount } from "../../../../test/account.mock"
import {
  AccountTokensButtons,
  AccountTokensButtonsProps,
} from "./AccountTokensButtons"

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
  onPlugins: vi.fn(),
  showHideMultisigButton: true,
  onHideMultisigModalOpen: vi.fn(),
  isHideMultisigModalOpen: true,
  onHideMultisigModalClose: vi.fn(),
  onHideConfirm: vi.fn(),
  portfolioUrl: "https://example.com",
  buttonColumnCount: 3,
} as AccountTokensButtonsProps

describe("AccountTokensButtons", async () => {
  it("renders the component with all buttons and triggers the appropriate actions", async () => {
    render(<AccountTokensButtons {...mockProps} />)

    // Add funds button
    const addFundsButton = await screen.findAllByText(/Fund/, {
      selector: "button",
    })
    expect(addFundsButton[0]).toBeInTheDocument()
    fireEvent.click(addFundsButton[0])
    expect(mockProps.onAddFunds).toHaveBeenCalled()

    // Send button
    const sendButton = screen.getByText(/Send/, { selector: "button" })
    expect(sendButton).toBeInTheDocument()
    fireEvent.click(sendButton)
    expect(mockProps.onSend).toHaveBeenCalled()

    // Hide account button
    const hideAccountButton = screen.getByText(/Hide account/, {
      selector: "button",
    })
    expect(hideAccountButton).toBeInTheDocument()
    fireEvent.click(hideAccountButton)
    expect(mockProps.onHideMultisigModalOpen).toHaveBeenCalled()
  })
})
