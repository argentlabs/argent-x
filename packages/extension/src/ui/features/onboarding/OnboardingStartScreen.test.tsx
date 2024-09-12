import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { OnboardingStartScreen } from "./OnboardingStartScreen"

describe("OnboardingStartScreen", () => {
  test("calls onCreate or onRestore when appropriate button is clicked", () => {
    const onCreate = vi.fn()
    const onRestore = vi.fn()
    const onRestorePreset = vi.fn()

    render(
      <OnboardingStartScreen
        onCreate={onCreate}
        onRestore={onRestore}
        onRestorePreset={onRestorePreset}
      />,
    )

    fireEvent.click(screen.getByText(/^Create/))
    fireEvent.click(screen.getByText(/^Restore an existing wallet/))

    expect(onCreate).toHaveBeenCalled()
    expect(onRestore).toHaveBeenCalled()
  })
})
