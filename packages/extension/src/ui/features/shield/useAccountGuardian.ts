import { useMemo } from "react"

import { withGuardianSelector } from "../../../shared/account/selectors"
import { useAccounts } from "../accounts/accounts.state"

export const useAccountsWithGuardian = () => {
  const allAccounts = useAccounts({ showHidden: true, allNetworks: true })

  const filteredAccounts = useMemo(
    () => allAccounts.filter(withGuardianSelector),
    [allAccounts],
  )

  return filteredAccounts
}
