import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import copy from "copy-to-clipboard"

import { ExportPublicKeyScreen } from "./ExportPublicKeyScreen"
import { defaultNetwork } from "../../../../shared/network"
import { encodeBase58 } from "ethers"
import * as routesFile from "../../../hooks/useRoute"

const accountAddress =
  "0x5c0a3b526acc19ced3663c859b877107a6c5eda646186c09ce94e82b15bfdc9"
const publicKey =
  "0x0765dff74b4edc6fe5d10b0a538134d030bef8beeeab482c1f1e956e16a777ef"

vi.mock("copy-to-clipboard", () => ({
  __esModule: true,
  default: vi.fn(),
}))

vi.mock("../../networks/hooks/useCurrentNetwork", () => ({
  useCurrentNetwork: vi.fn(() => defaultNetwork),
}))

vi.mock("../../accounts/usePublicKey", () => ({
  usePublicKey: vi.fn(() => publicKey),
}))

vi.spyOn(routesFile, "useRouteAccountAddress").mockReturnValue(accountAddress)

describe("ExportPublicKeyScreen", () => {
  it("renders the component with correctly formatted key", async () => {
    const user = userEvent.setup()

    const { container } = render(
      <BrowserRouter>
        <ExportPublicKeyScreen />
      </BrowserRouter>,
    )

    const encodedPublicKey = encodeBase58(publicKey)

    /** check the text displayed on screen */
    expect(await screen.findByText(encodedPublicKey)).toBeInTheDocument()

    /** check the attribute passed into the qr code */
    const qrCode = container.querySelector(`[data-testid="qr-code"]`)
    if (!qrCode) {
      throw new Error("QR code not found")
    }
    expect(qrCode.getAttribute("data-key")).toEqual(encodedPublicKey)

    /** check the value copied to clipboard */
    const copyButton = screen.getByRole("button", { name: /copy/i })
    await user.click(copyButton)
    expect(copy).toHaveBeenCalledWith(encodedPublicKey)
  })
})
