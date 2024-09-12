import { generateMnemonic } from "@scure/bip39"
import { wordlist as en } from "@scure/bip39/wordlists/english"
import {
  act,
  fireEvent,
  render,
  waitFor,
  getByTestId,
} from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { OnboardingRestoreSeedScreen } from "./OnboardingRestoreSeedScreen"

describe("OnboardingRestoreSeedScreen", async () => {
  it("onRestore is called with the seed input", async () => {
    const onRestore = vi.fn()
    const seed = generateMnemonic(en)
    const seedSplit = seed.split(" ")

    const screen = render(<OnboardingRestoreSeedScreen onRestore={onRestore} />)
    const { container } = screen

    const focusedInput = getByTestId(container, "seed-input-0")
    expect(focusedInput).toHaveFocus()
    if (focusedInput) {
      await act(async () => {
        fireEvent.blur(focusedInput)
      })
    }

    const passwordElements = container.querySelectorAll(
      `input[type="password"]`,
    )
    expect(passwordElements.length).toBe(12)

    passwordElements.forEach((passwordElement, index) => {
      const value = seedSplit[index]
      fireEvent.change(passwordElement, {
        target: { value },
      })
    })

    await act(async () => {
      screen.getByText(/^Continue$/).click()
    })

    await waitFor(() => expect(onRestore).toHaveBeenCalledWith(seed))
  })
})
