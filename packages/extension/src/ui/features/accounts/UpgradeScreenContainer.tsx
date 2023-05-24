import { FC, useCallback, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { UpgradeScreen } from "./UpgradeScreen"

export const UpgradeScreenContainer: FC = () => {
  const navigate = useNavigate()
  const selectedAccount = useView(selectedAccountView)

  const onUpgrade = useCallback(async () => {
    if (!selectedAccount) {
      return
    }
    await accountService.upgrade(selectedAccount)
    navigate(routes.accountTokens())
  }, [navigate, selectedAccount])

  const onCancel = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])

  if (!selectedAccount) {
    // If no account is selected, navigate to the account list screen. Dont show anything while doing so.
    return <Navigate to={routes.accounts()} replace={true} />
  }

  return <UpgradeScreen onUpgrade={onUpgrade} onCancel={onCancel} />
}
