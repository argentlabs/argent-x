import { isEqualAddress, normalizeAddressOrStarknetId } from "@argent/shared"
import { useMemo } from "react"

import { useAppState } from "../../app.state"
import { addressBookContactsOnNetworkView } from "../../views/addressBook"
import { useView } from "../../views/implementation/react"

export const useFilteredContacts = (query?: string) => {
  const { switcherNetworkId } = useAppState()
  const contacts = useView(addressBookContactsOnNetworkView(switcherNetworkId))
  const filteredContacts = useMemo(() => {
    if (!query) {
      return contacts
    }

    const queryLowercase = query.trim().toLowerCase()

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(queryLowercase) ||
        contact.address.toLowerCase().includes(queryLowercase) ||
        normalizeAddressOrStarknetId(contact.address)
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
