import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"

describe("OnboardingPasswordScreen", () => {
  it("onSubmit does not work until passwords match", async () => {
    const onSubmit = vi.fn()

    const { container } = render(
      <OnboardingPasswordScreen onSubmit={onSubmit} />,
    )

    const passwordElement = container.querySelector(`input[name="password"]`)
    const repeatPasswordElement = container.querySelector(
      `input[name="repeatPassword"]`,
    )

    expect(screen.getByText(/^Create wallet$/)).toBeDisabled()

    if (passwordElement) {
      fireEvent.change(passwordElement, { target: { value: "password123" } })
    }

    fireEvent.click(screen.getByText(/^Create wallet$/))

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())

    if (repeatPasswordElement) {
      fireEvent.change(repeatPasswordElement, {
        target: { value: "password123" },
      })
    }

    expect(screen.getByText(/^Create wallet$/)).not.toBeDisabled()

    fireEvent.click(screen.getByText(/^Create wallet$/))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("password123"))
  })

  it("button text changes when loading", async () => {
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((_, rej) => {
          setTimeout(rej, 200)
        }),
    )

    const { rerender, container } = render(
      <OnboardingPasswordScreen onSubmit={onSubmit} />,
    )

    const passwordElement = container.querySelector(`input[name="password"]`)
    const repeatPasswordElement = container.querySelector(
      `input[name="repeatPassword"]`,
    )

    if (!passwordElement || !repeatPasswordElement) {
      throw new Error("Password elements not found")
    }

    fireEvent.change(passwordElement, { target: { value: "password123" } })
    fireEvent.change(repeatPasswordElement, {
      target: { value: "password123" },
    })

    expect(screen.getByText(/^Create wallet$/)).not.toBeDisabled()

    fireEvent.click(screen.getByText(/^Create wallet$/))

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())

    rerender(<OnboardingPasswordScreen onSubmit={onSubmit} />)

    expect(screen.getByText(/^Creating wallet…$/)).toBeDisabled()

    await act(async () => {
      await onSubmit().catch(() => {
        // Do nothing
      })
    })

    rerender(<OnboardingPasswordScreen onSubmit={onSubmit} />)

    expect(screen.getByText(/^Retry create wallet$/)).not.toBeDisabled()
  })
})
