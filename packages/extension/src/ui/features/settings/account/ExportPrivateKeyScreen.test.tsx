import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import copy from "copy-to-clipboard"

import { ExportPrivateKeyScreen } from "./ExportPrivateKeyScreen"

vi.mock("copy-to-clipboard", () => ({
  __esModule: true,
  default: vi.fn(),
}))

/** Not a private key */
const privateKey = "0x123"

describe("ExportPrivateKeyScreen", () => {
  it("renders the component with correctly formatted key", async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const verifyPassword = vi.fn()

    const { container } = render(
      <BrowserRouter>
        <ExportPrivateKeyScreen
          passwordIsValid
          privateKey={privateKey}
          onBack={onBack}
          verifyPassword={verifyPassword}
        />
      </BrowserRouter>,
    )

    /** check the text displayed on screen */
    expect(await screen.findByText(privateKey)).toBeInTheDocument()

    /** check the attribute passed into the qr code */
    const qrCode = container.querySelector(`[data-testid="qr-code"]`)
    if (!qrCode) {
      throw new Error("QR code not found")
    }
    expect(qrCode.getAttribute("data-key")).toEqual(privateKey)

    /** check the value copied to clipboard */
    const copyButton = screen.getByRole("button", { name: /copy/i })
    await user.click(copyButton)
    expect(copy).toHaveBeenCalledWith(privateKey)
  })
})
