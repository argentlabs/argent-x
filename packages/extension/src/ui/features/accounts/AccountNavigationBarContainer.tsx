import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useMultisig } from "../multisig/multisig.state"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { AccountNavigationBarContainerProps } from "./accountNavigationBar.model"
import { useOnSettingsNavigate } from "./useOnSettingsNavigate"

export const AccountNavigationBarContainer: FC<
  AccountNavigationBarContainerProps
> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const account = useView(selectedAccountView)
  const hasAccount = Boolean(account)

  // TODO: refactor multisig to use services and views
  const multisig = useMultisig(account)

  const isShield = Boolean(account?.guardian)
  const isMultisig = Boolean(multisig)

  const onAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const onSettings = useOnSettingsNavigate(account)

  const accountName = account && account.name

  return (
    <AccountNavigationBar
      showAccountButton={hasAccount}
      accountName={accountName}
      isShield={isShield}
      isMultisig={isMultisig}
      onAccountList={onAccountList}
      onSettings={onSettings}
      {...props}
    />
  )
}
