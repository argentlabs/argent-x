import { FC, useCallback, useEffect } from "react"
import { useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { PendingMultisig } from "../../../shared/multisig/types"
import { unhidePendingMultisig } from "../../../shared/multisig/utils/pendingMultisig"
import { WalletAccount } from "../../../shared/wallet.model"
import { useAppState } from "../../app.state"
import { useNavigateReturnToOr } from "../../hooks/useNavigateReturnTo"
import { routes } from "../../routes"
import { hiddenAccountsOnNetworkFamily } from "../../views/account"
import { useView } from "../../views/implementation/react"
import {
  isHiddenPendingMultisig,
  usePendingMultisigsOnNetwork,
} from "../multisig/multisig.state"
import { AccountListHiddenScreen } from "./AccountListHiddenScreen"

export const AccountListHiddenScreenContainer: FC = () => {
  const { networkId } = useParams()
  // TODO: refactor to use view as soon as networks are using views
  const { switcherNetworkId } = useAppState()
  const navigateReturnTo = useNavigateReturnToOr(routes.accounts())

  const hiddenAccounts = useView(
    hiddenAccountsOnNetworkFamily(networkId ?? switcherNetworkId),
  )

  const hiddenPendingMultisigAccounts = usePendingMultisigsOnNetwork({
    showHidden: true,
    networkId: networkId ?? switcherNetworkId,
  }).filter(isHiddenPendingMultisig)

  useEffect(() => {
    const hasHiddenAccounts =
      hiddenAccounts.length > 0 || hiddenPendingMultisigAccounts.length > 0
    if (!hasHiddenAccounts) {
      navigateReturnTo()
    }
  }, [
    hiddenAccounts.length,
    hiddenPendingMultisigAccounts.length,
    navigateReturnTo,
  ])

  const onUnhideAccount = useCallback((account: WalletAccount) => {
    void accountService.setHide(false, account)
  }, [])

  const onUnhidePendingMultisig = useCallback(
    (pendingMultisig: PendingMultisig) => {
      void unhidePendingMultisig(pendingMultisig) // TODO: use service. Skipped for now, as multisig is not yet stable enough to do refactor on.
    },
    [],
  )

  return (
    <AccountListHiddenScreen
      onBack={navigateReturnTo}
      hiddenAccounts={hiddenAccounts}
      hiddenPendingMultisigAccounts={hiddenPendingMultisigAccounts}
      onUnhideAccount={onUnhideAccount}
      onUnhidePendingMultisig={onUnhidePendingMultisig}
    />
  )
}
