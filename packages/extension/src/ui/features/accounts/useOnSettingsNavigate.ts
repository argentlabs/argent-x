import { useCallback } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { useNavigate } from "react-router-dom"
import { selectedAccountView } from "../../views/account"
import { clientAccountService } from "../../services/account"
import { useView } from "../../views/implementation/react"

export const useOnSettingsNavigate = (
  account?: WalletAccount,
  settingsAccount = false,
) => {
  const selectedAccount = useView(selectedAccountView)
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()

  const onSettings = useCallback(async () => {
    if (account && selectedAccount?.address !== account.address) {
      await clientAccountService.select(account.id)
    }
    if (multisig && !signerIsInMultisig) {
      navigate(routes.multisigRemovedSettings(multisig.id, returnTo))
    } else {
      if (settingsAccount) {
        if (account) {
          navigate(routes.settingsAccount(account.id, returnTo))
        }
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
