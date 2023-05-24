import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderWithLegacyProviders } from "../../test/utils"
import { UpgradeScreenV4 } from "./UpgradeScreenV4"

describe("UpgradeScreenV4", () => {
  describe("When the upgrade is account", () => {
    it("Calls expected methods when buttons are clicked", async () => {
      const onUpgrade = vi.fn()
      const onClose = vi.fn()
      const onOpenMainnet = vi.fn()
      const onOpenTestnet = vi.fn()

      const { container } = renderWithLegacyProviders(
        <UpgradeScreenV4
          upgradeType={"account"}
          onUpgrade={onUpgrade}
          onClose={onClose}
          fromAccountTokens={false}
          onOpenMainnet={onOpenMainnet}
          onOpenTestnet={onOpenTestnet}
        />,
      )

      userEvent.click(screen.getByText("Upgrade Account"))
      expect(onUpgrade).toHaveBeenCalled()

      const closeButtonElement = container.querySelector(`[aria-label="Close"]`)
      if (!closeButtonElement) {
        throw new Error("Close button not found")
      }

      await act(async () => {
        userEvent.click(closeButtonElement)
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
  describe("When the upgrade is network", () => {
    it("Calls expected methods when buttons are clicked", async () => {
      const onUpgrade = vi.fn()
      const onClose = vi.fn()
      const onOpenMainnet = vi.fn()
      const onOpenTestnet = vi.fn()

      renderWithLegacyProviders(
        <UpgradeScreenV4
          upgradeType={"network"}
          onUpgrade={onUpgrade}
          onClose={onClose}
          fromAccountTokens={false}
          onOpenMainnet={onOpenMainnet}
          onOpenTestnet={onOpenTestnet}
          v4UpgradeAvailableOnMainnet
          v4UpgradeAvailableOnTestnet
        />,
      )

      userEvent.click(screen.getByText("Go to mainnet accounts"))
      expect(onOpenMainnet).toHaveBeenCalled()

      userEvent.click(screen.getByText("Go to testnet accounts"))
      expect(onOpenTestnet).toHaveBeenCalled()
    })
  })
})
