import type { AddressBookContact } from "../../shared/addressBook/type"
import type { WalletAccount } from "../../shared/wallet.model"
import { visibleAccountsOnNetworkFamily } from "../views/account"
import {
  addressBookContactsOnNetworkView,
  allAddressBookContactsView,
} from "../views/addressBook"
import { useView } from "../views/implementation/react"

export interface AddressBook {
  userAccounts: WalletAccount[]
  contacts: AddressBookContact[]
}

/**
 * @deprecated use specific `useView(...)` instead
 */
export const useAddressBook = (networkId?: string): AddressBook => {
  const addressBookContactsOnNetwork = useView(
    networkId
      ? addressBookContactsOnNetworkView(networkId)
      : allAddressBookContactsView,
  )

  const userAccountsOnNetwork = useView(
    visibleAccountsOnNetworkFamily(networkId),
  )

  return {
    userAccounts: userAccountsOnNetwork,
    contacts: addressBookContactsOnNetwork,
  }
}
