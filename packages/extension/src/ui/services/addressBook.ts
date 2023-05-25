import { accountNetworkSelector } from "./../../shared/addressBook/selectors"
import { AddressBookContact, addressBookStore } from "../../shared/addressBook"
import { useArrayStorage } from "../../shared/storage/hooks"
import { WalletAccount } from "../../shared/wallet.model"
import { allAccountsView } from "../views/account"
import { useView } from "../views/implementation/react"

export interface AddressBook {
  userAccounts: WalletAccount[]
  contacts: AddressBookContact[]
}

export const useAddressBook = (networkId?: string): AddressBook => {
  const contactsOnNetwork = useArrayStorage<AddressBookContact>(
    addressBookStore,
    networkId ? accountNetworkSelector(networkId) : undefined,
  )

  const allUserAccounts = useView(allAccountsView)
  const userAccounts = allUserAccounts.filter((a) => a.networkId === networkId)

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
