import { FC } from "react"
import { usePreAuthorizationsForAccount } from "../../preAuthorizations/hooks"
import { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useRouteAccount } from "../../shield/useRouteAccount"
import { DappConnectionsAccountScreen } from "./DappConnectionsAccountScreen"
import { preAuthorizationService } from "../../../../shared/preAuthorization/service"

export const DappConnectionsAccountScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const account = useRouteAccount()
  const preAuthorizations = usePreAuthorizationsForAccount(account)

  const onRemove = (preAuthorization: PreAuthorization) => {
    void preAuthorizationService.remove(preAuthorization)
    if (preAuthorizations.length === 1) {
      onBack()
    }
  }

  const onRemoveAll = () => {
    if (account) {
      void preAuthorizationService.removeAll(account)
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
