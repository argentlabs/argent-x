import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { AddNewAccountScreen } from "./AddNewAccountScreen"
import { AccountType, AccountTypeId } from "./AddNewAccountScreen"

describe("AddNewAccountScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const isAccountTypeLoading = vi.fn(() => false)
    const onAccountTypeClick = vi.fn()
    const onClose = vi.fn()

    const accountTypes: AccountType[] = [
      {
        id: AccountTypeId.STANDARD,
        type: "standard",
        title: "Standard Account",
        subtitle: "Create a new Argent X account",
      },
      {
        id: AccountTypeId.MULTISIG,
        type: "multisig",
        title: "Multisig Account",
        subtitle: "For multiple owners",
      },
    ]

    renderWithLegacyProviders(
      <AddNewAccountScreen
        accountTypes={accountTypes}
        isAccountTypeLoading={isAccountTypeLoading}
        onAccountTypeClick={onAccountTypeClick}
        onClose={onClose}
      />,
    )

    expect(isAccountTypeLoading).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByText("Standard Account"))
    expect(onAccountTypeClick).toHaveBeenCalledWith(AccountTypeId.STANDARD)

    fireEvent.click(screen.getByText("Multisig Account"))
    expect(onAccountTypeClick).toHaveBeenCalledWith(AccountTypeId.MULTISIG)
  })
})
