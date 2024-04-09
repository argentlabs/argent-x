import { useCallback } from "react"
import { WalletAccount } from "../../../shared/wallet.model"
import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { useNavigate } from "react-router-dom"
import { selectedAccountView } from "../../views/account"
import { clientAccountService } from "../../services/account"
import { useView } from "../../views/implementation/react"

export const useOnSettingsNavigate = (
  account?: WalletAccount,
  settingsAccount = false,
) => {
  const selectedAccount = useView(selectedAccountView)
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()

  const onSettings = useCallback(async () => {
    if (account && selectedAccount?.address !== account.address) {
      await clientAccountService.select(account)
    }
    if (multisig && !signerIsInMultisig) {
      navigate(routes.multisigRemovedSettings(multisig.address, returnTo))
    } else {
      if (settingsAccount) {
        navigate(routes.settingsAccount(account?.address, returnTo))
      } else {
        navigate(routes.settings(returnTo))
      }
    }
  }, [
    account,
    multisig,
    navigate,
    returnTo,
    selectedAccount?.address,
    settingsAccount,
    signerIsInMultisig,
  ])
  return onSettings
}
