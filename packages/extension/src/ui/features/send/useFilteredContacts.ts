import { isEqualAddress, normalizeAddressOrDomain } from "@argent/x-shared"
import { useMemo } from "react"

import { addressBookContactsOnNetworkView } from "../../views/addressBook"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

export const useFilteredContacts = (query?: string) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const contacts = useView(addressBookContactsOnNetworkView(selectedNetworkId))
  const filteredContacts = useMemo(() => {
    if (!query) {
      return contacts
    }

    const queryLowercase = query.trim().toLowerCase()

    return contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(queryLowercase) ||
        contact.address.toLowerCase().includes(queryLowercase) ||
        normalizeAddressOrDomain(contact.address)
          .toLowerCase()
          .includes(queryLowercase) ||
        isEqualAddress(contact.address, query),
    )
  }, [query, contacts])

  return {
    contacts,
    filteredContacts,
  }
}
