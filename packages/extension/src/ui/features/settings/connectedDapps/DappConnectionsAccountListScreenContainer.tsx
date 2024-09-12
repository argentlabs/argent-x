import { FC } from "react"
import { usePreAuthorizationsGroupedByAccountIdentifierForNetworkId } from "../../preAuthorizations/hooks"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { DappConnectionsAccountListScreen } from "./DappConnectionsAccountListScreen"
import { selectedNetworkIdView } from "../../../views/network"
import { useView } from "../../../views/implementation/react"

export const DappConnectionsAccountListScreenContainer: FC = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const onBack = useNavigateReturnToOrBack()
  const preAuthorizationsByAccountIdentifier =
    usePreAuthorizationsGroupedByAccountIdentifierForNetworkId(
      selectedNetworkId,
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
