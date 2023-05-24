import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { MigrationDisclaimerScreen } from "./MigrationDisclaimerScreen"

describe("MigrationDisclaimerScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onCreate = vi.fn()

    renderWithLegacyProviders(<MigrationDisclaimerScreen onCreate={onCreate} />)

    fireEvent.click(screen.getByText("Create new account"))
    expect(onCreate).toHaveBeenCalled()
  })
})
