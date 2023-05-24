import { fireEvent, render, screen } from "@testing-library/react"

import { Multisig } from "./Multisig"
import { getMockMultisig } from "./multisig.mock"
import { RemovedMultisigSettingsScreen } from "./RemovedMultisigSettingsScreen"

const mockMultisig = {
  ...getMockMultisig({ name: "Test Multisig" }),
} as Multisig

test("renders account name", () => {
  render(
    <RemovedMultisigSettingsScreen
      multisig={mockMultisig}
      accountName="Test Account"
      onHideMultisigModalOpen={() => null}
      onHideMultisigModalClose={() => null}
      isHideMultisigModalOpen={false}
      onHideConfirm={() => undefined}
    />,
  )
  const accountNameElement = screen.getByText(/Test Account/i)
  expect(accountNameElement).toBeInTheDocument()
})

test("opens 'Hide account' modal when hide button is clicked", () => {
  const handleHideMultisigModalOpen = vi.fn()

  render(
    <RemovedMultisigSettingsScreen
      multisig={mockMultisig}
      accountName="Test Account"
      onHideMultisigModalOpen={handleHideMultisigModalOpen}
      onHideMultisigModalClose={() => null}
      isHideMultisigModalOpen={false}
      onHideConfirm={() => undefined}
    />,
  )

  const hideButtonElement = screen.getByText(/Hide account/i)
  fireEvent.click(hideButtonElement)

  expect(handleHideMultisigModalOpen).toHaveBeenCalledTimes(1)
})
