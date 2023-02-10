import { useMemo } from "react"

import { Account } from "../accounts/Account"
import { useAccounts } from "../accounts/accounts.state"

export const accountHasGuardian = (account: Account) =>
  Boolean(account.guardian)

export const useAccountsWithGuardian = () => {
  const allAccounts = useAccounts({ showHidden: true, allNetworks: true })

  const filteredAccounts = useMemo(
    () => allAccounts.filter(accountHasGuardian),
    [allAccounts],
  )

  return filteredAccounts
}
