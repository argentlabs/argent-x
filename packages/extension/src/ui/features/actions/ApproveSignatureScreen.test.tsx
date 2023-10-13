import { fireEvent, screen } from "@testing-library/react"
import { describe } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { dataToSign } from "./__fixtures__"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"

describe("ApproveSignatureScreen", () => {
  it("Renders as expectd", () => {
    const onReject = vi.fn()
    const onSubmit = vi.fn()

    renderWithLegacyProviders(
      <ApproveSignatureScreen
        dataToSign={dataToSign}
        onReject={onReject}
        onSubmit={onSubmit}
      />,
    )

    expect(
      screen.getByText(/A dapp wants you to sign this message/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor/,
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText("Reject"))
    expect(onReject).toHaveBeenCalled()

    fireEvent.click(screen.getByText("Sign"))
    expect(onSubmit).toHaveBeenCalled()
  })
})
