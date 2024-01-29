import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import copy from "copy-to-clipboard"

import { FundingQrCodeScreen } from "./FundingQrCodeScreen"
import { normalizeAddress } from "@argent/shared"

vi.mock("copy-to-clipboard", () => ({
  __esModule: true,
  default: vi.fn(),
}))

const accountAddress =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

describe("FundingQrCodeScreen", () => {
  it("renders the component with correctly formatted address", async () => {
    const user = userEvent.setup()

    const { container } = render(
      <BrowserRouter>
        <FundingQrCodeScreen
          accountName="Account 1"
          accountAddress={accountAddress}
        />
      </BrowserRouter>,
    )

    expect(await screen.findByText("Account 1")).toBeInTheDocument()

    /** read the attribute passed into the qr code */
    const qrCode = container.querySelector(`[class="qrcode"]`)
    if (!qrCode) {
      throw new Error("QR code not found")
    }
    expect(qrCode.getAttribute("data-address")).toEqual(
      "0x07E00d496E324876BbC8531f2D9A82bf154d1A04a50218eE74CdD372F75a551A",
    )

    const formattedAddress = container.querySelector(
      `[aria-label="Full account address"]`,
    )
    if (!formattedAddress) {
      throw new Error("Formatted address not found")
    }

    /** in production app, this address will be formatted */
    await user.click(formattedAddress)

    // Need to change the test a bit to make it work with happy-dom
    // See issue: https://github.com/capricorn86/happy-dom/issues/1153
    const normalizedAddress = normalizeAddress(accountAddress)
    const copyButton = screen.getByRole("button", { name: /copy address/i })
    await user.click(copyButton)
    expect(copy).toHaveBeenCalledWith(normalizedAddress)
  })
})
