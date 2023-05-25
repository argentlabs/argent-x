import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { AccountListScreenItem } from "./AccountListScreenItem"

describe("AccountListScreenItem", () => {
  const account = {
    accountName: "Account 1",
    accountAddress: "0x123",
    networkId: "goerli-alpha",
  }
  describe("With default accessory", () => {
    it("Calls expected methods when clicked", async () => {
      const onClick = vi.fn()
      const onAccessoryClick = vi.fn()

      const { container } = render(
        <AccountListScreenItem
          onClick={onClick}
          onAccessoryClick={onAccessoryClick}
          {...account}
        />,
      )

      userEvent.click(screen.getByText(/^Account 1/))
      expect(onClick).toHaveBeenCalled()

      const accessoryElement = container.querySelector(
        `[aria-label='Account 1 options']`,
      )
      if (!accessoryElement) {
        throw new Error("Accessory not found")
      }

      userEvent.click(accessoryElement)
      expect(onAccessoryClick).toHaveBeenCalled()
    })
  })
  describe("Without accessory", () => {
    it("Calls expected methods when clicked", async () => {
      const onClick = vi.fn()
      const onAccessoryClick = vi.fn()

      const { container } = render(
        <AccountListScreenItem
          clickNavigateSettings
          onClick={onClick}
          onAccessoryClick={onAccessoryClick}
          {...account}
        />,
      )

      userEvent.click(screen.getByText(/^Account 1/))
      expect(onAccessoryClick).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()

      const accessoryElement = container.querySelector(
        `[aria-label='Account 1 options']`,
      )
      expect(accessoryElement).not.toBeInTheDocument()
    })
  })
})
