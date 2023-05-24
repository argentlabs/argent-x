import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { AccountScreenEmpty } from "./AccountScreenEmpty"

describe("AccountScreenEmpty", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onCreate = vi.fn()

    renderWithLegacyProviders(
      <AccountScreenEmpty
        hasHiddenAccounts={false}
        currentNetworkName={"Foo bar network"}
        onCreate={onCreate}
      />,
    )

    await screen.findByText("Create account")
    userEvent.click(screen.getByText("Create account"))
    expect(onCreate).toHaveBeenCalled()
  })
})
