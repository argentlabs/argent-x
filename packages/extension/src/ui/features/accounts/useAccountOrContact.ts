import type { AddressOrDomain } from "@argent/x-shared"
import { isEqualAddress, isEqualStarknetDomainName } from "@argent/x-shared"
import { starknetId } from "starknet"
import { useMemo } from "react"
import { visibleAccountsOnNetworkFamily } from "../../views/account"
import { addressBookContactsOnNetworkView } from "../../views/addressBook"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

/**
 * return account and contact matching the provided accountAddress or starknet id
 */

export const useAccountOrContact = (accountAddress?: AddressOrDomain) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  return useAccountOrContactOnNetworkId({
    address: accountAddress,
    networkId: selectedNetworkId,
  })
}

export const useAccountOrContactOnNetworkId = ({
  address,
  networkId,
}: {
  address?: AddressOrDomain
  networkId: string
}) => {
  const isStarknetDomainNameAddress = starknetId.isStarkDomain(address ?? "")

  const contacts = useView(addressBookContactsOnNetworkView(networkId))
  const contact = useMemo(() => {
    return contacts.find((contact) => {
      if (isStarknetDomainNameAddress && address) {
        return isEqualStarknetDomainName(address, contact.address)
      }
      return isEqualAddress(contact.address, address)
    })
  }, [address, contacts, isStarknetDomainNameAddress])

  const accounts = useView(visibleAccountsOnNetworkFamily(networkId))
  const account = useMemo(() => {
    return accounts.find((account) => isEqualAddress(account.address, address))
  }, [address, accounts])

  return {
    contact,
    account,
  }
}
