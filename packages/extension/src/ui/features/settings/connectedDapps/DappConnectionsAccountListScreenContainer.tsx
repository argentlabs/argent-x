import { FC } from "react"
import { usePreAuthorizationsGroupedByAccountIdentifierForNetworkId } from "../../preAuthorizations/hooks"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { DappConnectionsAccountListScreen } from "./DappConnectionsAccountListScreen"
import { useAppState } from "../../../app.state"

export const DappConnectionsAccountListScreenContainer: FC = () => {
  const { switcherNetworkId } = useAppState()
  const onBack = useNavigateReturnToOrBack()
  const preAuthorizationsByAccountIdentifier =
    usePreAuthorizationsGroupedByAccountIdentifierForNetworkId(
      switcherNetworkId,
    )
  return (
    <DappConnectionsAccountListScreen
      onBack={onBack}
      preAuthorizationsByAccountIdentifier={
        preAuthorizationsByAccountIdentifier
      }
    />
  )
}
