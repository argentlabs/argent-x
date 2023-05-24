import { partition } from "lodash-es"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { isAccountHidden } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { routes, useReturnTo } from "../../routes"
import { isEqualAddress } from "../../services/addresses"
import {
  selectedAccountView,
  visibleAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import { LoadingScreenContainer } from "../actions/LoadingScreenContainer"
import {
  isHiddenPendingMultisig,
  usePendingMultisigs,
} from "../multisig/multisig.state"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { Account } from "./Account"
import { AccountListScreen } from "./AccountListScreen"
import { usePartitionDeprecatedAccounts } from "./upgrade.service"

/** TODO: we should be able to retreive all these account collections using queries from storage */
export const AccountListScreenContainer: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { switcherNetworkId } = useAppState()

  const selectedAccount = useView(selectedAccountView)
  const allAccounts = useView(visibleAccountsOnNetworkFamily(switcherNetworkId))
  const [hiddenAccounts, visibleAccounts] = useMemo(
    () => partition(allAccounts, isAccountHidden),
    [allAccounts],
  )

  // TODO: refactor to use view as soon as multisig is using views
  const pendingMultisigs = usePendingMultisigs({ showHidden: true })
  const [hiddenPendingMultisigs, visiblePendingMultisigs] = partition(
    pendingMultisigs,
    isHiddenPendingMultisig,
  )

  // TODO: get rid of this global state and have it as an atom
  const { isBackupRequired } = useBackupRequired()
  // TODO: refactor to use view as soon as network is using views
  const currentNetwork = useCurrentNetwork()

  // TODO: make this a property of the account
  const { data: partitionedAccounts } = usePartitionDeprecatedAccounts(
    visibleAccounts,
    currentNetwork,
  )

  const accountFromAddress = useCallback(
    (accountAddress: string) => {
      return allAccounts.find(
        (account) =>
          isEqualAddress(account.address, accountAddress) &&
          currentNetwork.id === account.networkId,
      )
    },
    [allAccounts, currentNetwork],
  )

  const fullPartitionedAccounts = useMemo(() => {
    if (!partitionedAccounts) {
      return
    }

    const [newAccounts, deprecatedAccounts] = partitionedAccounts

    const deprecatedFullAccounts = deprecatedAccounts
      .map((accountAddress) => accountFromAddress(accountAddress))
      .filter((account): account is Account => Boolean(account))

    const newFullAccounts = newAccounts
      .map((accountAddress) => accountFromAddress(accountAddress))
      .filter((account): account is Account => Boolean(account))

    return [newFullAccounts, deprecatedFullAccounts]
  }, [accountFromAddress, partitionedAccounts])

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      void recover().then(navigate)
    }
  }, [navigate, returnTo])

  const onAdd = useCallback(() => {
    navigate(routes.newAccount())
  }, [navigate])

  if (!fullPartitionedAccounts) {
    return <LoadingScreenContainer />
  }

  const [newAccounts, deprecatedAccounts] = fullPartitionedAccounts

  const [multisigAccounts, standardAccounts] = partition(
    newAccounts,
    (account) => account.type === "multisig",
  )

  const title = `${currentNetwork.name} accounts`

  return (
    <AccountListScreen
      deprecatedAccounts={deprecatedAccounts}
      hiddenAccounts={hiddenAccounts}
      hiddenPendingMultisigs={hiddenPendingMultisigs}
      isBackupRequired={isBackupRequired}
      multisigAccounts={multisigAccounts}
      newAccounts={newAccounts}
      onAdd={onAdd}
      onClose={onClose}
      pendingMultisigs={pendingMultisigs}
      returnTo={returnTo}
      selectedAccount={selectedAccount}
      standardAccounts={standardAccounts}
      title={title}
      visiblePendingMultisigs={visiblePendingMultisigs}
    />
  )
}
