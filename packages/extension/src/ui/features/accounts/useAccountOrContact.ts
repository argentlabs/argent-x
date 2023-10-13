import {
  AddressOrStarknetId,
  isEqualAddress,
  isEqualStarknetId,
  isStarknetId,
} from "@argent/shared"
import { useMemo } from "react"
import { useAppState } from "../../app.state"
import { visibleAccountsOnNetworkFamily } from "../../views/account"
import { addressBookContactsOnNetworkView } from "../../views/addressBook"
import { useView } from "../../views/implementation/react"

/**
 * return account and contact matching the provided accountAddress or starknet id
 */

export const useAccountOrContact = (accountAddress?: AddressOrStarknetId) => {
  const { switcherNetworkId } = useAppState()

  const isStarknetIdQuery = isStarknetId(accountAddress)

  const contacts = useView(addressBookContactsOnNetworkView(switcherNetworkId))
  const contact = useMemo(() => {
    return contacts.find((contact) => {
      if (isStarknetIdQuery) {
        return isEqualStarknetId(accountAddress, contact.address)
      }
      return isEqualAddress(contact.address, accountAddress)
    })
  }, [accountAddress, contacts, isStarknetIdQuery])

  const accounts = useView(visibleAccountsOnNetworkFamily(switcherNetworkId))
  const account = useMemo(() => {
    return accounts.find((account) =>
      isEqualAddress(account.address, accountAddress),
    )
  }, [accountAddress, accounts])

  return {
    contact,
    account,
  }
}
