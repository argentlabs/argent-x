import { ArrayStorage } from "../storage"
import { AddressBookAccount } from "./type"

export const equalAddress = (a: AddressBookAccount, b: AddressBookAccount) =>
  a.address === b.address && a.networkId === b.networkId

export const addressBookStore = new ArrayStorage<AddressBookAccount>([], {
  namespace: "core:addressbook",
  compare: equalAddress,
})
