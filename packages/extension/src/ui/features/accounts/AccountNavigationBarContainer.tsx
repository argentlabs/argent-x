import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { multisigView } from "../multisig/multisig.state"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { AccountNavigationBarContainerProps } from "./accountNavigationBar.model"
import { useOnSettingsNavigate } from "./useOnSettingsNavigate"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"

const argentXEnv = process.env.ARGENT_X_ENVIRONMENT || ""

export const AccountNavigationBarContainer: FC<
  AccountNavigationBarContainerProps
> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const account = useView(selectedAccountView)
  const hasAccount = Boolean(account)

  const multisig = useView(multisigView(account))

  const isGuardian = Boolean(account?.guardian)
  const isMultisig = Boolean(multisig)

  const isLedgerAccount = useIsLedgerSigner(account) && !isMultisig // Multisig has higher icon priority

  const onAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const onSettings = useOnSettingsNavigate(account)

  const accountName = account && account.name

  const envLabel = argentXEnv === "hydrogen" ? "Hydrogen" : undefined

  return (
    <AccountNavigationBar
      showAccountButton={hasAccount}
      accountName={accountName}
      isSmartAccount={isGuardian}
      isMultisig={isMultisig}
      isLedgerAccount={isLedgerAccount}
      onAccountList={onAccountList}
      onSettings={onSettings}
      envLabel={envLabel}
      {...props}
    />
  )
}
