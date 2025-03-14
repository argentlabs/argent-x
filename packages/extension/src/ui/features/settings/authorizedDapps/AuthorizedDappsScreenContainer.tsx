import { voidify, type BackendSession } from "@argent/x-shared"
import type { FC } from "react"

import { accountSharedService } from "../../../../shared/account/service"
import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { preAuthorizationUIService } from "../../../services/preAuthorization"
import { useIsSignedIn } from "../../argentAccount/hooks/useIsSignedIn"
import { usePreAuthorizationsForAccount } from "../../preAuthorizations/hooks"
import { useActiveSessionsGroupedByAccountIdentifierForNetworkId } from "../../sessionKeys/hooks"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import { AuthorizedDappsScreen } from "./AuthorizedDappsScreen"

export const AuthorizedDappsScreenContainer: FC = () => {
  const isSignedIn = useIsSignedIn({
    initiator: "AuthorizedDappsScreenContainer",
  })
  const onBack = useNavigateReturnToOrBack()
  const account = useRouteWalletAccount()
  const preAuthorizations = usePreAuthorizationsForAccount(account)
  const isSmartAccount = account?.type === "smart"

  // use the same data as the authorized dapps list screen so we can invalidate it when needed
  const { data: activeSessionsByAccountIdentifier, mutate } =
    useActiveSessionsGroupedByAccountIdentifierForNetworkId(
      account?.networkId ?? "",
    )

  const activeSessions =
    account && activeSessionsByAccountIdentifier?.[account?.id]

  const onDisconnectDapp = (preAuthorization: PreAuthorization) => {
    void preAuthorizationUIService.remove(preAuthorization)
  }

  const onRevokeSession = async (session: BackendSession) => {
    await accountSharedService.revokeSession(session)
    await mutate()
  }

  const onRemoveAll = () => {
    if (account) {
      void preAuthorizationUIService.removeAll(account)
    }
  }

  if (!account) {
    return null
  }

  return (
    <AuthorizedDappsScreen
      onBack={onBack}
      accountName={account.name}
      networkId={account.networkId}
      preAuthorizations={preAuthorizations}
      activeSessions={activeSessions}
      onRemoveAll={onRemoveAll}
      onDisconnectDapp={onDisconnectDapp}
      onRevokeSession={voidify(onRevokeSession)}
      isSignedIn={isSignedIn}
      isSmartAccount={isSmartAccount}
    />
  )
}
