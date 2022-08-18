import { accountNetworkSelector } from "./../../shared/addressBook/selectors"
import { AddressBookContact, addressBookStore } from "../../shared/addressBook"
import { useArrayStorage } from "../../shared/storage/hooks"
import { Account } from "../features/accounts/Account"
import { useAccounts } from "../features/accounts/accounts.state"

export interface AddressBook {
  userAccounts: Account[]
  contacts: AddressBookContact[]
}

export const useAddressBook = (networkId?: string): AddressBook => {
  const contactsOnNetwork = useArrayStorage<AddressBookContact>(
    addressBookStore,
    networkId ? accountNetworkSelector(networkId) : undefined,
  )

  const userAccounts = useAccounts()

  if (!networkId) {
    return { userAccounts, contacts: contactsOnNetwork }
  }

  const userAccountsOnNetwork = userAccounts.filter(
    (acc) => acc.networkId === networkId,
  )

  return {
    userAccounts: userAccountsOnNetwork,
    contacts: contactsOnNetwork,
  }
}
