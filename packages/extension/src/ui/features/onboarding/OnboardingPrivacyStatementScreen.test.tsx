import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  OnboardingPrivacyStatementScreen,
  OnboardingPrivacyStatementScreenProps,
} from "./OnboardingPrivacyStatementScreen"

describe("OnboardingPrivacyStatementScreen", () => {
  const defaultProps: OnboardingPrivacyStatementScreenProps = {
    onBack: vi.fn(),
  }

  const renderComponent = (
    props: OnboardingPrivacyStatementScreenProps = defaultProps,
  ) => {
    return render(<OnboardingPrivacyStatementScreen {...props} />)
  }

  it("renders the title and privacy text", () => {
    const screen = renderComponent()

    expect(screen.getByText("Privacy statement")).toBeInTheDocument()
    expect(
      screen.getByText(/^GDPR statement for browser extension wallet.+/),
    ).toBeInTheDocument()
  })

  it("renders the back button and calls onBack when clicked", () => {
    const onBack = vi.fn()
    const screen = renderComponent({
      onBack,
    })

    const backButton = screen.getByText("Back")
    expect(backButton).toBeInTheDocument()

    userEvent.click(backButton)
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
