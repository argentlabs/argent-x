import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  OnboardingFinishScreen,
  OnboardingFinishScreenProps,
} from "./OnboardingFinishScreen"

describe("OnboardingFinishScreen", () => {
  const defaultProps: OnboardingFinishScreenProps = {
    onFinish: vi.fn(),
  }

  const renderComponent = (
    props: OnboardingFinishScreenProps = defaultProps,
  ) => {
    return render(<OnboardingFinishScreen {...props} />)
  }

  it("renders the title, subtitle, and icon correctly", () => {
    const screen = renderComponent()

    expect(screen.getByText("Your wallet is ready!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Follow us for product updates or if you have any questions",
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId("TickCircleIcon")).toBeInTheDocument()
  })

  it("renders the follow Twitter button and link", () => {
    const screen = renderComponent()

    const twitterButton = screen.getByText("Follow Argent X on Twitter")
    expect(twitterButton).toBeInTheDocument()
    expect(twitterButton.closest("a")).toHaveAttribute(
      "href",
      "https://twitter.com/argenthq",
    )
    expect(twitterButton.closest("a")).toHaveAttribute("target", "_blank")
  })

  it("renders the join Discord button and link", () => {
    const screen = renderComponent()

    const discordButton = screen.getByText("Join the Argent X Discord")
    expect(discordButton).toBeInTheDocument()
    expect(discordButton.closest("a")).toHaveAttribute(
      "href",
      "https://discord.gg/T4PDFHxm6T",
    )
    expect(discordButton.closest("a")).toHaveAttribute("target", "_blank")
  })

  it("renders the finish button and calls onFinishClick when clicked", () => {
    const onFinish = vi.fn()
    const screen = renderComponent({
      onFinish,
    })

    const finishButton = screen.getByText("Finish")
    expect(finishButton).toBeInTheDocument()

    userEvent.click(finishButton)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it.skip("renders the snackbar with pin extension message and icon", () => {
    const screen = renderComponent()

    expect(
      screen.getByText("Pin the Argent X extension for quick access"),
    ).toBeInTheDocument()
    expect(screen.getByTestId("extension-icon")).toBeInTheDocument()
  })
})
