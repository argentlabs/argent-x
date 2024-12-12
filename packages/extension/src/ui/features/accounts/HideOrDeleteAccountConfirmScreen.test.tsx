import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { HideOrDeleteAccountConfirmScreen } from "./HideOrDeleteAccountConfirmScreen"

describe("HideOrDeleteAccountConfirmScreen", () => {
  it("Calls expected methods when buttons are clicked", async () => {
    const onReject = vi.fn()
    const onSubmit = vi.fn()

    renderWithLegacyProviders(
      <HideOrDeleteAccountConfirmScreen
        mode={"hide"}
        accountName={"Foo bar account"}
        accountAddress={"0x123"}
        accountType="standard"
        onReject={onReject}
        onSubmit={onSubmit}
        networkId="2"
      />,
    )

    fireEvent.click(screen.getByTestId("hide-or-delete-account-confirm-button"))
    expect(onSubmit).toHaveBeenCalled()
  })
})
