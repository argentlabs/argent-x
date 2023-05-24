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
        mode={"delete"}
        accountName={"Foo bar account"}
        accountAddress={"0x123"}
        onReject={onReject}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(onReject).toHaveBeenCalled()

    fireEvent.click(screen.getByText("Delete"))
    expect(onSubmit).toHaveBeenCalled()
  })
})
