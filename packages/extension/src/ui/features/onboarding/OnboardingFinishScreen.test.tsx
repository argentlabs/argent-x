import { render, act, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OnboardingFinishScreen } from "./OnboardingFinishScreen"

describe("OnboardingFinishScreen", () => {
  const renderComponent = () => {
    return render(<OnboardingFinishScreen />)
  }

  it("renders the follow X button and link", async () => {
    await act(async () => {
      renderComponent()
    })
    const twitterButton = await screen.findByTestId("twitter-link")
    expect(twitterButton).toBeInTheDocument()
    expect(twitterButton).toHaveAttribute(
      "href",
      "https://twitter.com/argenthq",
    )
    expect(twitterButton).toHaveAttribute("target", "_blank")
  })

  it("renders the dappland button and link", async () => {
    await act(async () => {
      renderComponent()
    })
    const dapplandButton = await screen.getByTestId("dappland-link")
    expect(dapplandButton).toBeInTheDocument()
    expect(dapplandButton).toHaveAttribute("href", "https://dappland.com")
    expect(dapplandButton).toHaveAttribute("target", "_blank")
  })

  it.skip("renders the snackbar with pin extension message and icon", async () => {
    await act(async () => {
      renderComponent()
    })
    expect(
      screen.getByText("Pin the Argent X extension for quick access"),
    ).toBeInTheDocument()
    expect(screen.getByTestId("extension-icon")).toBeInTheDocument()
  })

  it("renders the title and subtitle", async () => {
    await act(async () => {
      renderComponent()
    })
    expect(screen.getByText("Your account is ready!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Get ready to experience the power of Argent + Starknet",
      ),
    ).toBeInTheDocument()
  })
})
