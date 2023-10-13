import { isEqualAddress, normalizeAddressOrStarknetId } from "@argent/shared"
import { useMemo } from "react"

import { useAppState } from "../../app.state"
import { visibleAccountsOnNetworkFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"

export const useFilteredAccounts = (query?: string) => {
  const { switcherNetworkId } = useAppState()
  const accounts = useView(visibleAccountsOnNetworkFamily(switcherNetworkId))
  const filteredAccounts = useMemo(() => {
    if (!query) {
      return accounts
    }

    const queryLowercase = query.toLowerCase()

    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(queryLowercase) ||
        account.address.toLowerCase().includes(queryLowercase) ||
        normalizeAddressOrStarknetId(account.address)
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
