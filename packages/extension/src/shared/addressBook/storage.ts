import { ArrayStorage } from "../storage"
import { AddressBookContact } from "./type"

export const equalContact = (a: AddressBookContact, b: AddressBookContact) =>
  (a.address === b.address && a.networkId === b.networkId) || a.id === b.id

export const addressBookStore = new ArrayStorage<AddressBookContact>([], {
  namespace: "core:addressbook",
  compare: equalContact,
})
