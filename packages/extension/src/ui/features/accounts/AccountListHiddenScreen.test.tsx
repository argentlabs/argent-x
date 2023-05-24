import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PendingMultisig } from "../../../shared/multisig/types"
import { renderWithLegacyProviders } from "../../test/utils"
import { Account } from "./Account"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"

describe("AccountListHiddenScreen", () => {
  it("Calls expected method when account is clicked", async () => {
    const onUnhideAccount = vi.fn()
    const onUnhidePendingMultisig = vi.fn()
    const onBack = vi.fn()

    const hiddenAccounts = [
      {
        name: "Account 1 Lorem Ipsum Dolor Sit Amet",
        address: "0x123",
        networkId: "goerli-alpha",
      },
    ] as Account[]

    const hiddenPendingMultisigAccounts = [
      {
        name: "Multi Sig",
        type: "multisig",
        hidden: true,
        publicKey: "0xabc",
      },
    ] as PendingMultisig[]

    renderWithLegacyProviders(
      <AccountListHiddenScreen
        onBack={onBack}
        hiddenAccounts={hiddenAccounts}
        hiddenPendingMultisigAccounts={hiddenPendingMultisigAccounts}
        onUnhideAccount={onUnhideAccount}
        onUnhidePendingMultisig={onUnhidePendingMultisig}
      />,
    )

    fireEvent.click(screen.getByText(/^Account 1/))
    expect(onUnhideAccount).toHaveBeenCalledWith(hiddenAccounts[0])

    fireEvent.click(screen.getByText(/^Multi Sig/))
    expect(onUnhidePendingMultisig).toHaveBeenCalledWith(
      hiddenPendingMultisigAccounts[0],
    )
  })
})
