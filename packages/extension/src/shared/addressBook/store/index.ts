import { ArrayStorage } from "../../storage"
import type { IRepository } from "../../storage/__new/interface"
import { adaptArrayStorage } from "../../storage/__new/repository"
import type { AddressBookContact } from "../type"

export type IAddressBookRepo = IRepository<AddressBookContact>

export const compareAddressBookContacts = (
  a: AddressBookContact,
  b: AddressBookContact,
) => (a.address === b.address && a.networkId === b.networkId) || a.id === b.id

/**
 * @deprecated use `addressBookRepo` instead
 */

export const addressBookStore = new ArrayStorage<AddressBookContact>([], {
  namespace: "core:addressbook",
  compare: compareAddressBookContacts,
})

export const addressBookRepo: IAddressBookRepo =
  adaptArrayStorage(addressBookStore)
