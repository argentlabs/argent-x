import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { DeployAccountScreen } from "./DeployAccountScreen"

describe("DeployAccountScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onReject = vi.fn()
    const onActivate = vi.fn()

    const { container } = renderWithLegacyProviders(
      <DeployAccountScreen onReject={onReject} onActivate={onActivate} />,
    )

    fireEvent.click(screen.getByText("Activate Account"))
    expect(onActivate).toHaveBeenCalled()

    const closeButtonElement = container.querySelector(`[aria-label="Close"]`)
    if (!closeButtonElement) {
      throw new Error("Close button not found")
    }

    fireEvent.click(closeButtonElement)
    expect(onReject).toHaveBeenCalled()
  })
})
