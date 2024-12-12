import type { FC } from "react"
import { usePreAuthorizationsForAccount } from "../../preAuthorizations/hooks"
import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import { DappConnectionsAccountScreen } from "./DappConnectionsAccountScreen"
import { preAuthorizationUIService } from "../../../services/preAuthorization"

export const DappConnectionsAccountScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const account = useRouteWalletAccount()
  const preAuthorizations = usePreAuthorizationsForAccount(account)

  const onRemove = (preAuthorization: PreAuthorization) => {
    void preAuthorizationUIService.remove(preAuthorization)
    if (preAuthorizations.length === 1) {
      onBack()
    }
  }

  const onRemoveAll = () => {
    if (account) {
      void preAuthorizationUIService.removeAll(account)
    }
    onBack()
  }

  return (
    <DappConnectionsAccountScreen
      accountName={account?.name}
      preAuthorizations={preAuthorizations}
      onRemoveAll={onRemoveAll}
      onRemove={onRemove}
    />
  )
}
