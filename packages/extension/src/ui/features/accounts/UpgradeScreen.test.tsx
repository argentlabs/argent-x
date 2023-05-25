import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { UpgradeScreen } from "./UpgradeScreen"

describe("UpgradeScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onUpgrade = vi.fn()
    const onCancel = vi.fn()

    renderWithLegacyProviders(
      <UpgradeScreen onCancel={onCancel} onUpgrade={onUpgrade} />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalled()

    fireEvent.click(screen.getByText("Upgrade"))
    expect(onUpgrade).toHaveBeenCalled()
  })
})
