import { addressBookAccountSchema } from "./../addressBook/schema"
import { accountNetworkSelector } from "./../addressBook/selectors"
import { addressBookStore } from "./../addressBook/storage"
import { AddressBookAccount } from "./../addressBook/type"
import { SelectorFn } from "../storage/types"
import { assertSchema } from "../utils/schema"

export const getAddressBookAccounts = async (
  selector?: SelectorFn<AddressBookAccount>,
): Promise<AddressBookAccount[]> => {
  return await addressBookStore.get(selector)
}

export const getAddressBookAccountsOnNetwork = async (
  networkId: string,
): Promise<AddressBookAccount[]> => {
  return await getAddressBookAccounts(accountNetworkSelector(networkId))
}

export const getAddressBookByKey = async (
  key: keyof AddressBookAccount,
  networkId?: string,
) => {
  if (networkId) {
    return (await getAddressBookAccountsOnNetwork(networkId)).map(
      (account) => account[key],
    )
  }

  return (await getAddressBookAccounts()).map((account) => account[key])
}

export const getAddressBookAddresses = async () => {
  return await getAddressBookByKey("address")
}

export const getAddressBookName = async () => {
  return await getAddressBookByKey("name")
}

export const addAddressBookAccount = async (account: AddressBookAccount) => {
  await assertSchema(addressBookAccountSchema, account)

  return addressBookStore.add(account)
}

export const removeAddressBookAccount = async (account: AddressBookAccount) => {
  await assertSchema(addressBookAccountSchema, account)

  return addressBookStore.remove(account)
}

export const editAddressBookAccount = async (
  account: AddressBookAccount,
  index: number,
) => {
  await assertSchema(addressBookAccountSchema, account)

  const oldAccount = (await getAddressBookAccounts())[index]

  if (!oldAccount) {
    throw new Error("Account to edit not found")
  }

  // Maybe a better way to implement edit?
  await addAddressBookAccount(account)

  return await removeAddressBookAccount(oldAccount)
}

export type { AddressBookAccount } from "./type"
export { addressBookAccountSchema } from "./schema"
export { addressBookStore } from "./storage"
