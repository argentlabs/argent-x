import type { AddressBookContact, AddressBookContactNoId } from "../type"

export interface IAddressBookService {
  add(
    contact: AddressBookContactNoId | AddressBookContact,
  ): Promise<AddressBookContact>
  update(contact: AddressBookContact): Promise<AddressBookContact>
  remove(contact: AddressBookContact): Promise<AddressBookContact>
}
