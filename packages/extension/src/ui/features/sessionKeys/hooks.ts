import type { BackendSession } from "@argent/x-shared"
import useSWR from "swr"

import { accountSharedService } from "../../../shared/account/service"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { allAccountsOnNetworkFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsSignedIn } from "../argentAccount/hooks/useIsSignedIn"

export const useActiveSessionsForAccount = (account?: BaseWalletAccount) => {
  const isSignedIn = useIsSignedIn({ initiator: "useActiveSessionsForAccount" })
  return useSWR(
    account && isSignedIn && [account.id, "account-sessions"],
    async () => {
      return accountSharedService.getActiveSessions({ account })
    },
  )
}

export const useActiveSessionsGroupedByAccountIdentifierForNetworkId = (
  networkId: string,
) => {
  const isSignedIn = useIsSignedIn({
    initiator: "useActiveSessionsGroupedByAccountIdentifierForNetworkId",
  })
  const accounts = useView(allAccountsOnNetworkFamily(networkId))
  return useSWR<Record<string, BackendSession[]>>(
    networkId && isSignedIn && [networkId, "network-sessions"],
    async () => {
      const sessionsGroupedByAccountIdentifier: Record<
        string,
        BackendSession[]
      > = {}
      await Promise.allSettled(
        accounts.map(async (account) => {
          const sessions = await accountSharedService.getActiveSessions({
            account,
          })
          if (sessions && sessions.length > 0) {
            sessionsGroupedByAccountIdentifier[account.id] = sessions
          }
        }),
      )
      return sessionsGroupedByAccountIdentifier
    },
  )
}
