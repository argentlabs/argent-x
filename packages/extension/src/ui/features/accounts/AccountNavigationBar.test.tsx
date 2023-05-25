import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { AccountNavigationBar } from "./AccountNavigationBar"

describe("AccountNavigationBar", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onAccountList = vi.fn()
    const onSettings = vi.fn()

    const { container } = renderWithLegacyProviders(
      <AccountNavigationBar
        accountName={"Account 1"}
        onAccountList={onAccountList}
        onSettings={onSettings}
        showNetworkSwitcher={false}
      />,
    )

    fireEvent.click(screen.getByText(/^Account 1/))
    expect(onAccountList).toHaveBeenCalled()

    const settingButtonElement = container.querySelector(
      `[aria-label="Show settings"]`,
    )
    if (!settingButtonElement) {
      throw new Error("Settings button not found")
    }

    fireEvent.click(settingButtonElement)
    expect(onSettings).toHaveBeenCalled()
  })
})
