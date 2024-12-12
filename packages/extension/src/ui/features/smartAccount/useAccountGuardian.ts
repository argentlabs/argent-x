import { useMemo, useRef } from "react"
import useSWR from "swr"

import { withGuardianSelector } from "../../../shared/account/selectors"
import type { WalletAccount } from "../../../shared/wallet.model"
import { withPolling } from "../../services/swr.service"
import { allAccountsView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { accountMessagingService } from "../../services/accountMessaging"
import { isEqualAddress } from "@argent/x-shared"

export const useAccountsWithGuardian = () => {
  const allAccounts = useView(allAccountsView)

  const filteredAccounts = useMemo(
    () => allAccounts.filter(withGuardianSelector),
    [allAccounts],
  )

  return filteredAccounts
}

export const useAccountGuardianIsSelf = (account?: WalletAccount) => {
  const publicKey = useRef<string>()
  const { data: accountGuardianIsSelf = null } = useSWR(
    account ? [account.id, "accountGuardianIsSelf"] : null,
    async () => {
      if (!account?.guardian) {
        return false
      }
      if (!publicKey.current) {
        publicKey.current = await accountMessagingService.getPublicKey(
          account.id,
        )
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
