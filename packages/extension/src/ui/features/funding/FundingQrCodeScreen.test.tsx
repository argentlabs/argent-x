import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { FundingQrCodeScreen } from "./FundingQrCodeScreen"

/**
 * @vitest-environment jsdom
 */
describe("FundingQrCodeScreen", () => {
  it("renders the component with correctly formatted address", async () => {
    /** provides a stub for navigator.clipboard, requires jsdom */
    const user = userEvent.setup()

    const { container } = render(
      <BrowserRouter>
        <FundingQrCodeScreen
          accountName="Account 1"
          accountAddress="0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"
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
    await user.copy()
    const text = await navigator.clipboard.readText()
    expect(text).toEqual(
      "0x 07E0 0d49 6E32 4876 BbC8 531f 2D9A 82bf 154d 1A04 a502 18eE 74Cd D372 F75a 551A",
    )
  })
})
