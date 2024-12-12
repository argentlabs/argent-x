import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { AccountScreenEmpty } from "./AccountScreenEmpty"

describe("AccountScreenEmpty", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onAddAccount = vi.fn()
    const onHiddenAccounts = vi.fn()
    renderWithLegacyProviders(
      <AccountScreenEmpty
        hasHiddenAccounts={false}
        currentNetworkName={"Foo bar network"}
        onHiddenAccounts={onHiddenAccounts}
        onAddAccount={onAddAccount}
      />,
    )
    await screen.findByText("Add account")
    fireEvent.click(screen.getByText("Add account"))
    expect(onAddAccount).toHaveBeenCalled()
  })
})
