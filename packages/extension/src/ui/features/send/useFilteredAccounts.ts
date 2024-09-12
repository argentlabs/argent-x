import { isEqualAddress, normalizeAddressOrDomain } from "@argent/x-shared"
import { useMemo } from "react"

import { visibleAccountsOnNetworkFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { selectedNetworkIdView } from "../../views/network"

export const useFilteredAccounts = (query?: string) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const accounts = useView(visibleAccountsOnNetworkFamily(selectedNetworkId))
  const filteredAccounts = useMemo(() => {
    if (!query) {
      return accounts
    }

    const queryLowercase = query.toLowerCase()

    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(queryLowercase) ||
        account.address.toLowerCase().includes(queryLowercase) ||
        normalizeAddressOrDomain(account.address)
          .toLowerCase()
          .includes(queryLowercase) ||
        isEqualAddress(account.address, query),
    )
  }, [query, accounts])

  return {
    accounts,
    filteredAccounts,
  }
}
