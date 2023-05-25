import { FC, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import {
  hiddenAccountsOnNetworkFamily,
  visibleAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AccountScreenEmpty } from "./AccountScreenEmpty"
import { autoSelectAccountOnNetwork } from "./switchAccount"

export const AccountScreenEmptyContainer: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const visibleAccounts = useView(
    visibleAccountsOnNetworkFamily(switcherNetworkId),
  )
  const hiddenAccounts = useView(
    hiddenAccountsOnNetworkFamily(switcherNetworkId),
  )
  const hasVisibleAccounts = visibleAccounts.length > 0
  const hasHiddenAccounts = hiddenAccounts.length > 0
  // TODO: refactor to use view as soon as networks are using views
  const currentNetwork = useCurrentNetwork()

  const onCreate = useCallback(() => {
    navigate(routes.newAccount())
  }, [navigate])

  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      void autoSelectAccountOnNetwork(currentNetwork.id)
    }
  }, [currentNetwork.id, hasVisibleAccounts])

  return (
    <AccountScreenEmpty
      hasHiddenAccounts={hasHiddenAccounts}
      currentNetworkName={currentNetwork.name}
      onCreate={onCreate}
    />
  )
}
