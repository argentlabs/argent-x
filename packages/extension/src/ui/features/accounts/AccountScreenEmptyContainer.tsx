import type { FC } from "react"
import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import {
  hiddenAccountsOnNetworkFamily,
  visibleAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountScreenEmpty } from "./AccountScreenEmpty"
import { clientAccountService } from "../../services/account"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import {
  isHiddenPendingMultisig,
  usePendingMultisigs,
} from "../multisig/multisig.state"
import { partition } from "lodash-es"
import { useNetwork } from "../networks/hooks/useNetwork"

interface AccountScreenEmptyContainerProps {
  networkId: string
  showAddButton?: boolean
  showHideButton?: boolean
}

export const AccountScreenEmptyContainer: FC<
  AccountScreenEmptyContainerProps
> = ({ networkId, showAddButton = true, showHideButton = true }) => {
  const navigate = useNavigate()
  const visibleAccounts = useView(visibleAccountsOnNetworkFamily(networkId))
  const hiddenAccounts = useView(hiddenAccountsOnNetworkFamily(networkId))
  // TODO: refactor to use view as soon as multisig is using views
  const pendingMultisigs = usePendingMultisigs({ showHidden: true })
  const [hiddenPendingMultisigs, visiblePendingMultisigs] = partition(
    pendingMultisigs,
    isHiddenPendingMultisig,
  )

  const hasVisibleAccounts =
    visibleAccounts.length > 0 || visiblePendingMultisigs.length > 0
  const hasHiddenAccounts =
    hiddenAccounts.length > 0 || hiddenPendingMultisigs.length > 0
  // TODO: refactor to use view as soon as networks are using views
  const network = useNetwork(networkId)
  const returnTo = useCurrentPathnameWithQuery()

  const onAddAccount = useCallback(() => {
    navigate(routes.newAccount(networkId, returnTo))
  }, [navigate, returnTo, networkId])

  const onHiddenAccounts = useCallback(() => {
    navigate(routes.accountsHidden(networkId, returnTo))
  }, [navigate, returnTo, networkId])

  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      void clientAccountService.autoSelectAccountOnNetwork(network.id)
    }
  }, [network.id, hasVisibleAccounts])

  return (
    <AccountScreenEmpty
      hasHiddenAccounts={hasHiddenAccounts}
      currentNetworkName={network.name}
      onAddAccount={onAddAccount}
      onHiddenAccounts={onHiddenAccounts}
      showAddButton={showAddButton}
      showHideButton={showHideButton}
    />
  )
}
