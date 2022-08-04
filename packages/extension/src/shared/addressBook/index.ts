import { addressBookContactSchema } from "./../addressBook/schema"
import { accountNetworkSelector } from "./../addressBook/selectors"
import { addressBookStore } from "./../addressBook/storage"
import { AddressBookContact } from "./../addressBook/type"
import { SelectorFn } from "../storage/types"
import { assertSchema } from "../utils/schema"

export const getAddressBookContacts = async (
  selector?: SelectorFn<AddressBookContact>,
): Promise<AddressBookContact[]> => {
  return await addressBookStore.get(selector)
}

export const getAddressBookContactsOnNetwork = async (
  networkId: string,
): Promise<AddressBookContact[]> => {
  return await getAddressBookContacts(accountNetworkSelector(networkId))
}

export const getAddressBookByKey = async (
  key: keyof AddressBookContact,
  networkId?: string,
) => {
  if (networkId) {
    return (await getAddressBookContactsOnNetwork(networkId)).map(
      (account) => account[key],
    )
  }

  return (await getAddressBookContacts()).map((account) => account[key])
}

export const getAddressBookByAddresses = async () => {
  return await getAddressBookByKey("address")
}

export const getAddressBookByNames = async () => {
  return await getAddressBookByKey("name")
}

export const addAddressBookContact = async (contact: AddressBookContact) => {
  await assertSchema(addressBookContactSchema, contact)
  await addressBookStore.push(contact)
  return contact
}

export const removeAddressBookContact = async (contact: AddressBookContact) => {
  await assertSchema(addressBookContactSchema, contact)
  await addressBookStore.remove(contact)
  return contact
}

export const editAddressBookContact = async (contact: AddressBookContact) => {
  await assertSchema(addressBookContactSchema, contact)
  await addAddressBookContact(contact)
  return contact
}

export type { AddressBookContact as AddressBookContact } from "./type"
export { addressBookContactSchema } from "./schema"
export { addressBookStore } from "./storage"
