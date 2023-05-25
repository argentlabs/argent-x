import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { OnboardingStartScreen } from "./OnboardingStartScreen"

describe("OnboardingStartScreen", () => {
  test("calls onCreate or onRestore when appropriate button is clicked", () => {
    const onCreate = vi.fn()
    const onRestore = vi.fn()

    render(<OnboardingStartScreen onCreate={onCreate} onRestore={onRestore} />)

    fireEvent.click(screen.getByText(/^Create/))
    fireEvent.click(screen.getByText(/^Restore/))

    expect(onCreate).toHaveBeenCalled()
    expect(onRestore).toHaveBeenCalled()
  })
})
