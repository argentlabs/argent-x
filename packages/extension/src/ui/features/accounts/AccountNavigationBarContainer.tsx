import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { AccountNavigationBarContainerProps } from "./accountNavigationBar.model"

export const AccountNavigationBarContainer: FC<
  AccountNavigationBarContainerProps
> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = useCurrentPathnameWithQuery()

  const account = useView(selectedAccountView)
  const hasAccount = Boolean(account)

  // TODO: refactor multisig to use services and views
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const isShield = Boolean(account?.guardian)
  const isMultisig = Boolean(multisig)

  const onAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const onSettings = useCallback(() => {
    if (multisig && !signerIsInMultisig) {
      navigate(routes.multisigRemovedSettings(multisig.address, returnTo))
    } else {
      navigate(routes.settings(returnTo))
    }
  }, [multisig, navigate, returnTo, signerIsInMultisig])

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
