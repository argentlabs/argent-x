import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { PendingMultisig } from "../../../shared/multisig/types"
import { renderWithLegacyProviders } from "../../test/utils"
import type { Account } from "./Account"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"
import { stark } from "starknet"
import { SignerType } from "../../../shared/wallet.model"

const mockLocalSigner = {
  type: SignerType.LOCAL_SECRET,
  derivationPath: "m/44'/9004'/0'/0/0",
}

const mockLedgerSigner = {
  type: SignerType.LEDGER,
  derivationPath: "m/2645'/1195502025'/1148870696'/0'/0'/1",
}

export const mockAccounts = [
  {
    id: "0x123-sepolia-alpha",
    name: "Account 1 Lorem Ipsum Dolor Sit Amet",
    address: "0x123",
    networkId: "sepolia-alpha",
    hidden: false,
    signer: mockLocalSigner,
    type: "standard",
  },
  {
    id: "0x456-sepolia-alpha",
    name: "Multisig 3 Lorem Ipsum Dolor Sit Amet",
    address: "0x456",
    networkId: "sepolia-alpha",
    hidden: false,
    type: "multisig",
    signer: mockLocalSigner,
  },
  {
    id: "0x234-sepolia-alpha",
    name: "Account 2 Lorem Ipsum Dolor Sit Amet",
    address: "0x234",
    networkId: "sepolia-alpha",
    hidden: false,
    signer: mockLocalSigner,
    type: "smart",
  },
  {
    id: "0x345-sepolia-alpha",
    name: "Account 3 Lorem Ipsum Dolor Sit Amet",
    address: "0x345",
    networkId: "sepolia-alpha",
    hidden: true,
    type: "ledger",
    signer: mockLedgerSigner,
  },
] as Account[]

const pendingMultisigAccounts: PendingMultisig[] = [
  {
    name: "Multi Sig 1",
    type: "multisig",
    hidden: false,
    publicKey: stark.randomAddress(),
    networkId: "sepolia-alpha",
    signer: mockLocalSigner,
  },
  {
    name: "Multi Sig 2",
    type: "multisig",
    hidden: true,
    publicKey: stark.randomAddress(),
    networkId: "sepolia-alpha",
    signer: mockLocalSigner,
  },
]

vi.mock("./accounts.state", () => {
  return {
    useWalletAccount: vi.fn(),
    mapWalletAccountsToAccounts: vi.fn(() => mockAccounts),
  }
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

    renderWithLegacyProviders(
      <AccountListHiddenScreen
        onBack={onBack}
        accounts={mockAccounts}
        pendingMultisigAccounts={pendingMultisigAccounts}
        onToggleHiddenAccount={onToggleHiddenAccount}
        onToggleHiddenPendingMultisig={onToggleHiddenPendingMultisig}
      />,
    )

    fireEvent.click(screen.getByText(/^Account 1/))
    expect(onToggleHiddenAccount).toHaveBeenCalledWith(mockAccounts[0], true)

    fireEvent.click(screen.getByText(/^Multi Sig 1/))
    expect(onToggleHiddenPendingMultisig).toHaveBeenCalledWith(
      pendingMultisigAccounts[0],
      true,
    )
  })
})
