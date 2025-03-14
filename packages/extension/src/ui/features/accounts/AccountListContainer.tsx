import { partition } from "lodash-es"
import type { FC } from "react"
import { useCallback } from "react"
import {
  selectedAccountView,
  visibleAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import {
  usePendingMultisigs,
  isHiddenPendingMultisig,
} from "../multisig/multisig.state"
import { AccountList } from "./AccountList"
import { usePartitionedAccountsByType } from "./usePartitionedAccountsByType"
import { routes } from "../../../shared/ui/routes"
import { useNavigate } from "react-router-dom"
import { clientAccountService } from "../../services/account"
import { voidify } from "@argent/x-shared"
import { delay } from "../../../shared/utils/delay"

interface AccountListContainerProps {
  networkId: string
  returnTo?: string
}

export const AccountListContainer: FC<AccountListContainerProps> = ({
  networkId,
  returnTo,
}) => {
  const selectedAccount = useView(selectedAccountView)
  const visibleAccounts = useView(visibleAccountsOnNetworkFamily(networkId))
  const navigate = useNavigate()

  // TODO: refactor to use view as soon as multisig is using views
  const pendingMultisigs = usePendingMultisigs({ showHidden: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hiddenPendingMultisigs, visiblePendingMultisigs] = partition(
    pendingMultisigs,
    isHiddenPendingMultisig,
  )

  const { multisigAccounts, standardAccounts, importedAccounts } =
    usePartitionedAccountsByType(visibleAccounts)

  const onAddAccount = useCallback(async () => {
    /** Make sure to activate the current network selection before starting the account creation process */
    if (selectedAccount?.network.id !== networkId) {
      await clientAccountService.autoSelectAccountOnNetwork(networkId)
      /** allow change to propagate */
      await delay(0)
    }
    navigate(routes.newAccount(networkId, returnTo))
  }, [navigate, networkId, returnTo, selectedAccount?.network.id])

  return (
    <AccountList
      standardAccounts={standardAccounts}
      multisigAccounts={multisigAccounts}
      importedAccounts={importedAccounts}
      pendingMultisigs={pendingMultisigs}
      returnTo={returnTo}
      selectedAccount={selectedAccount}
      visiblePendingMultisigs={visiblePendingMultisigs}
      networkId={networkId}
      onAddAccount={voidify(onAddAccount)}
    />
  )
}
