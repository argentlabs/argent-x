import type { FC } from "react"
import { useCallback } from "react"
import { useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import type { PendingMultisig } from "../../../shared/multisig/types"
import { unhidePendingMultisig } from "../../../shared/multisig/utils/pendingMultisig"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useNavigateReturnToOr } from "../../hooks/useNavigateReturnTo"
import { routes } from "../../../shared/ui/routes"
import { useView } from "../../views/implementation/react"
import { usePendingMultisigsOnNetwork } from "../multisig/multisig.state"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"
import { allAccountsOnNetworkFamily } from "../../views/account"
import { selectedNetworkIdView } from "../../views/network"
import { useSortedAccounts } from "./useSortedAccounts"

export const AccountListHiddenScreenContainer: FC = () => {
  const { networkId } = useParams()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const navigateReturnTo = useNavigateReturnToOr(routes.accounts())

  const accounts = useView(allAccountsOnNetworkFamily(selectedNetworkId))

  const pendingMultisigAccounts = usePendingMultisigsOnNetwork({
    showHidden: true,
    networkId: networkId ?? selectedNetworkId,
  })

  const onToggleHiddenAccount = useCallback(
    (account: WalletAccount, hidden: boolean) => {
      void accountService.setHide(hidden, account.id)
    },
    [],
  )

  const onToggleHiddenPendingMultisig = useCallback(
    (pendingMultisig: PendingMultisig, hidden: boolean) => {
      void unhidePendingMultisig(pendingMultisig, hidden) // TODO: use service. Skipped for now, as multisig is not yet stable enough to do refactor on.
    },
    [],
  )

  const sortedAccounts = useSortedAccounts(accounts)

  return (
    <AccountListHiddenScreen
      onBack={navigateReturnTo}
      accounts={sortedAccounts}
      pendingMultisigAccounts={pendingMultisigAccounts}
      onToggleHiddenAccount={onToggleHiddenAccount}
      onToggleHiddenPendingMultisig={onToggleHiddenPendingMultisig}
    />
  )
}
