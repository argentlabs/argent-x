import { accountNetworkSelector } from "./../../shared/addressBook/selectors"
import { AddressBookContact, addressBookStore } from "../../shared/addressBook"
import { useArrayStorage } from "../../shared/storage/hooks"
import { Account } from "../features/accounts/Account"
import { useAccounts } from "../features/accounts/accounts.state"

export interface AddressBook {
  userAccounts: Account[]
  contacts: AddressBookContact[]
}

export const useAddressBook = (networkId: string): AddressBook => {
  const userAccountsOnNetwork = useAccounts().accounts.filter(
    (account) => account.networkId === networkId,
  )

  const contactsOnNetwork = useArrayStorage<AddressBookContact>(
    addressBookStore,
    accountNetworkSelector(networkId),
  )

  return {
    userAccounts: userAccountsOnNetwork,
    contacts: contactsOnNetwork,
  }
}
