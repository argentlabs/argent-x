import { FC, useCallback } from "react"
import { useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { PendingMultisig } from "../../../shared/multisig/types"
import { unhidePendingMultisig } from "../../../shared/multisig/utils/pendingMultisig"
import { WalletAccount } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { useNavigateReturnToOr } from "../../hooks/useNavigateReturnTo"
import { routes } from "../../routes"
import { useView } from "../../views/implementation/react"
import { usePendingMultisigsOnNetwork } from "../multisig/multisig.state"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"
import { allAccountsOnNetworkFamily } from "../../views/account"

export const AccountListHiddenScreenContainer: FC = () => {
  const { networkId } = useParams()
  // TODO: refactor to use view as soon as networks are using views
  const { switcherNetworkId } = useAppState()
  const navigateReturnTo = useNavigateReturnToOr(routes.accounts())

  const accounts = useView(allAccountsOnNetworkFamily(switcherNetworkId))

  const pendingMultisigAccounts = usePendingMultisigsOnNetwork({
    showHidden: true,
    networkId: networkId ?? switcherNetworkId,
  })

  const onToggleHiddenAccount = useCallback(
    (account: WalletAccount, hidden: boolean) => {
      void accountService.setHide(hidden, account)
    },
    [],
  )

  const onToggleHiddenPendingMultisig = useCallback(
    (pendingMultisig: PendingMultisig, hidden: boolean) => {
      void unhidePendingMultisig(pendingMultisig, hidden) // TODO: use service. Skipped for now, as multisig is not yet stable enough to do refactor on.
    },
    [],
  )

  return (
    <AccountListHiddenScreen
      onBack={navigateReturnTo}
      accounts={accounts}
      pendingMultisigAccounts={pendingMultisigAccounts}
      onToggleHiddenAccount={onToggleHiddenAccount}
      onToggleHiddenPendingMultisig={onToggleHiddenPendingMultisig}
    />
  )
}
