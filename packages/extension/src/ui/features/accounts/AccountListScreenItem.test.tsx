import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { AccountListScreenItem } from "./AccountListScreenItem"
import { renderWithLegacyProviders } from "../../test/utils"

vi.mock("./accounts.state", () => {
  return { useAccount: vi.fn() }
})
vi.mock("./useOnSettingsNavigate", () => {
  return { useOnSettingsNavigate: vi.fn() }
})
describe("AccountListScreenItem", async () => {
  const account = {
    accountName: "Account 1",
    accountAddress: "0x123",
    networkId: "sepolia-alpha",
  }
  describe("With default accessory", () => {
    it("Calls expected methods when clicked", async () => {
      const onClick = vi.fn()

      renderWithLegacyProviders(
        <AccountListScreenItem onClick={onClick} {...account} />,
      )

      await userEvent.click(screen.getByText(/^Account 1/))

      expect(onClick).toHaveBeenCalled()
    })
  })
  describe("Without accessory", () => {
    it("Calls expected methods when clicked", async () => {
      const onClick = vi.fn()

      renderWithLegacyProviders(
        <AccountListScreenItem
          clickNavigateSettings
          onClick={onClick}
          {...account}
        />,
      )

      await userEvent.click(screen.getByText(/^Account 1/))
      expect(onClick).toHaveBeenCalled()
    })
  })
})
