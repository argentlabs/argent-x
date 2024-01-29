import { fireEvent, render, screen, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OnboardingDisclaimerScreen } from "./OnboardingDisclaimerScreen"

describe("OnboardingDisclaimerScreen", () => {
  it("onContinue does not work until boxes are checked", async () => {
    const onContinue = vi.fn()
    const onPrivacy = vi.fn()

    render(
      <OnboardingDisclaimerScreen
        onContinue={onContinue}
        onPrivacy={onPrivacy}
      />,
    )

    expect(screen.getByText(/^Continue/)).toBeDisabled()

    act(() => {
      fireEvent.click(screen.getByText(/introduce changes/))
      fireEvent.click(screen.getByText(/experience performance/))
    })

    expect(screen.getByText(/^Continue/)).not.toBeDisabled()
    act(() => {
      fireEvent.click(screen.getByText(/^Continue/))
    })

    expect(onContinue).toHaveBeenCalled()
  })

  it("calls onPrivacy when appropriate button is clicked", () => {
    const onContinue = vi.fn()
    const onPrivacy = vi.fn()

    render(
      <OnboardingDisclaimerScreen
        onContinue={onContinue}
        onPrivacy={onPrivacy}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText(/^Privacy/))
    })

    expect(onPrivacy).toHaveBeenCalled()
  })
})
