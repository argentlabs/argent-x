import { act, fireEvent, render, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { OnboardingRestoreBackupScreen } from "./OnboardingRestoreBackupScreen"

describe("OnboardingRestoreBackupScreen", () => {
  it("renders the title and privacy text", () => {
    const onRestore = vi.fn()
    const screen = render(
      <OnboardingRestoreBackupScreen onRestore={onRestore} />,
    )

    expect(screen.getByText("Select backup")).toBeInTheDocument()
    expect(
      screen.getByText(/^Drag & drop your backup file here.+/),
    ).toBeInTheDocument()
  })

  it("enables the restore button when a file is dropped and calls onRestore with dropped file", async () => {
    const onRestore = vi.fn()
    const screen = render(
      <OnboardingRestoreBackupScreen onRestore={onRestore} />,
    )
    const { container } = screen
    const file = new File(["foo"], "foo.json", {
      type: "application/json",
    })

    const fileInputElement = container.querySelector(`input[type="file"]`)
    if (!fileInputElement) {
      throw new Error("File input not found")
    }

    expect(screen.getByText(/^Restore backup$/)).toBeDisabled()

    await act(async () => {
      fireEvent.change(fileInputElement, { target: { files: [file] } })
    })

    expect(screen.getByText(/^Restore backup$/)).not.toBeDisabled()

    fireEvent.click(screen.getByText(/^Restore backup$/))

    await waitFor(() => expect(onRestore).toHaveBeenCalledWith(file))
  })
})
