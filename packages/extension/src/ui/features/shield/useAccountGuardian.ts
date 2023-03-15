import { useMemo, useRef } from "react"
import useSWR from "swr"

import { withGuardianSelector } from "../../../shared/account/selectors"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isEqualAddress } from "../../services/addresses"
import { getPublicKey } from "../../services/backgroundAccounts"
import { withPolling } from "../../services/swr"
import { Account } from "../accounts/Account"
import { useAccounts } from "../accounts/accounts.state"

export const useAccountsWithGuardian = () => {
  const allAccounts = useAccounts({ showHidden: true, allNetworks: true })

  const filteredAccounts = useMemo(
    () => allAccounts.filter(withGuardianSelector),
    [allAccounts],
  )

  return filteredAccounts
}

export const useAccountGuardianIsSelf = (account?: Account) => {
  const publicKey = useRef<string>()
  const { data: accountGuardianIsSelf = null } = useSWR(
    account ? [getAccountIdentifier(account), "accountGuardianIsSelf"] : null,
    async () => {
      if (!account?.guardian) {
        return false
      }
      if (!publicKey.current) {
        publicKey.current = await getPublicKey(account)
      }
      const accountGuardianIsSelf = isEqualAddress(
        account.guardian,
        publicKey.current,
      )
      return accountGuardianIsSelf
    },
    {
      ...withPolling(1000) /** 1 second - purely cosmetic */,
    },
  )
  return accountGuardianIsSelf
}
