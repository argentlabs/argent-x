import type { FC } from "react"

import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { useView } from "../../../views/implementation/react"
import { selectedNetworkIdView } from "../../../views/network"
import { usePreAuthorizationsGroupedByAccountIdentifierForNetworkId } from "../../preAuthorizations/hooks"
import { useActiveSessionsGroupedByAccountIdentifierForNetworkId } from "../../sessionKeys/hooks"
import { AuthorizedDappsAccountListScreen } from "./AuthorizedDappsAccountListScreen"

export const AuthorizedDappsAccountListScreenContainer: FC = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const onBack = useNavigateReturnToOrBack()
  const preAuthorizationsByAccountIdentifier =
    usePreAuthorizationsGroupedByAccountIdentifierForNetworkId(
      selectedNetworkId,
    )
  const { data: activeSessionsByAccountIdentifier } =
    useActiveSessionsGroupedByAccountIdentifierForNetworkId(selectedNetworkId)

  return (
    <AuthorizedDappsAccountListScreen
      onBack={onBack}
      preAuthorizationsByAccountIdentifier={
        preAuthorizationsByAccountIdentifier
      }
      activeSessionsByAccountIdentifier={activeSessionsByAccountIdentifier}
    />
  )
}
