import { partition } from "lodash-es"
import { FC, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { isAccountHidden } from "../../../shared/wallet.service"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import {
  selectedAccountView,
  allAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import {
  isHiddenPendingMultisig,
  usePendingMultisigs,
} from "../multisig/multisig.state"
import { Account } from "./Account"
import { AccountListScreen } from "./AccountListScreen"
import {
  sortMultisigAccounts,
  sortStandardAccounts,
} from "../../../shared/utils/accountsMultisigSort"
import { isEqualAddress } from "@argent/x-shared"
import { selectedNetworkIdView, selectedNetworkView } from "../../views/network"

/** TODO: we should be able to retreive all these account collections using queries from storage */
export const AccountListScreenContainer: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const selectedNetwork = useView(selectedNetworkView)

  const selectedAccount = useView(selectedAccountView)
  const allAccounts = useView(allAccountsOnNetworkFamily(selectedNetworkId))

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

  const accountFromAddress = useCallback(
    (accountAddress: string) => {
      return allAccounts.find(
        (account) =>
          isEqualAddress(account.address, accountAddress) &&
          selectedNetworkId === account.networkId,
      )
    },
    [allAccounts, selectedNetworkId],
  )

  const accounts = visibleAccounts
    .map((account) => accountFromAddress(account.address))
    .filter((account): account is Account => Boolean(account))

  const onClose = useCallback(() => {
    navigate(returnTo || routes.accountTokens())
  }, [navigate, returnTo])

  const onAdd = useCallback(() => {
    navigate(routes.newAccount(returnTo))
  }, [navigate, returnTo])

  const { sortedMultisigAccounts, sortedStandardAccounts } = useMemo(() => {
    const [multisigAccounts, standardAccounts] = partition(
      accounts,
      (account) => account.type === "multisig",
    )

    const sortedMultisigAccounts = sortMultisigAccounts(multisigAccounts)

    const sortedStandardAccounts = sortStandardAccounts(standardAccounts)

    return {
      sortedMultisigAccounts,
      sortedStandardAccounts,
    }
  }, [accounts])

  const title = `${selectedNetwork.name} accounts`

  return (
    <AccountListScreen
      hiddenAccounts={hiddenAccounts}
      hiddenPendingMultisigs={hiddenPendingMultisigs}
      multisigAccounts={sortedMultisigAccounts}
      onAdd={onAdd}
      onClose={onClose}
      pendingMultisigs={pendingMultisigs}
      returnTo={returnTo}
      selectedAccount={selectedAccount}
      standardAccounts={sortedStandardAccounts}
      title={title}
      visiblePendingMultisigs={visiblePendingMultisigs}
    />
  )
}
