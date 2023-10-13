import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { AddressBook } from "../../hooks/useAddressBook"
import { AddressBookMenu } from "./AddressBookMenu"

describe("AddressBookMenu", () => {
  describe("When there are contacts", () => {
    it("Calls expected methods when buttons are clicked", async () => {
      const onAddressSelect = vi.fn()

      const addressBook = {
        userAccounts: [
          {
            name: "Account 1",
            address:
              "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            networkId: "goerli-alpha",
          },
        ],
        contacts: [
          {
            id: "123",
            name: "Contact 1",
            address:
              "0x7f14339f5d364946ae5e27eccbf60757a5c496bf45baf35ddf2ad30b583541a",
            networkId: "goerli-alpha",
          },
        ],
      } as unknown as AddressBook

      render(
        <AddressBookMenu
          addressBook={addressBook}
          onAddressSelect={onAddressSelect}
        />,
      )

      expect(screen.getByText("Addresses")).toBeInTheDocument()
      expect(screen.getByText("My accounts")).toBeInTheDocument()

      expect(screen.getByText("Contact 1")).toBeInTheDocument()
      await act(async () => {
        await userEvent.click(screen.getByText("Contact 1"))
      })
      expect(onAddressSelect).toHaveBeenCalledWith(addressBook.contacts[0])

      await act(async () => {
        await userEvent.click(screen.getByText("My accounts"))
      })

      expect(screen.getByText("Account 1")).toBeInTheDocument()

      await act(async () => {
        await userEvent.click(screen.getByText("Account 1"))
      })
      expect(onAddressSelect).toHaveBeenCalledWith(addressBook.userAccounts[0])
    })
  })
  describe("When there are no contacts", () => {
    it("Calls expected methods when buttons are clicked", async () => {
      const onAddressSelect = vi.fn()

      const addressBook = {
        userAccounts: [
          {
            name: "Account 1",
            address:
              "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            networkId: "goerli-alpha",
          },
        ],
      } as AddressBook

      render(
        <AddressBookMenu
          addressBook={addressBook}
          onAddressSelect={onAddressSelect}
        />,
      )

      expect(screen.queryByText("Addresses")).not.toBeInTheDocument()
      expect(screen.getByText("My accounts")).toBeInTheDocument()

      expect(screen.getByText("Account 1")).toBeInTheDocument()

      await act(async () => {
        await userEvent.click(screen.getByText("Account 1"))
      })
      expect(onAddressSelect).toHaveBeenCalledWith(addressBook.userAccounts[0])
    })
  })
})
