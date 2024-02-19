import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PendingMultisig } from "../../../shared/multisig/types"
import { renderWithLegacyProviders } from "../../test/utils"
import { Account } from "./Account"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"

vi.mock("./accounts.state", () => {
  return { useAccount: vi.fn() }
})
vi.mock("./useOnSettingsNavigate", () => {
  return {
    useOnSettingsNavigate: vi.fn(),
    useOnSettingsAccountNavigate: vi.fn(),
  }
})

describe("AccountListHiddenScreen", () => {
  it("Calls expected method when account is clicked", async () => {
    const onToggleHiddenAccount = vi.fn()
    const onToggleHiddenPendingMultisig = vi.fn()
    const onBack = vi.fn()

    const accounts = [
      {
        name: "Account 1 Lorem Ipsum Dolor Sit Amet",
        address: "0x123",
        networkId: "goerli-alpha",
        hidden: false,
      },
      {
        name: "Account 2 Lorem Ipsum Dolor Sit Amet",
        address: "0x124",
        networkId: "goerli-alpha",
        hidden: true,
      },
    ] as Account[]

    const pendingMultisigAccounts = [
      {
        name: "Multi Sig 1",
        type: "multisig",
        hidden: false,
        publicKey: "0xabc",
      },
      {
        name: "Multi Sig 2",
        type: "multisig",
        hidden: true,
        publicKey: "0xabcd",
      },
    ] as PendingMultisig[]

    renderWithLegacyProviders(
      <AccountListHiddenScreen
        onBack={onBack}
        accounts={accounts}
        pendingMultisigAccounts={pendingMultisigAccounts}
        onToggleHiddenAccount={onToggleHiddenAccount}
        onToggleHiddenPendingMultisig={onToggleHiddenPendingMultisig}
      />,
    )

    fireEvent.click(screen.getByText(/^Account 1/))
    expect(onToggleHiddenAccount).toHaveBeenCalledWith(accounts[0], true)

    fireEvent.click(screen.getByText(/^Multi Sig 1/))
    expect(onToggleHiddenPendingMultisig).toHaveBeenCalledWith(
      pendingMultisigAccounts[0],
      true,
    )
  })
})
