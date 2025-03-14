import { useNavigateBack } from "@argent/x-ui"
import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { routes } from "../../../shared/ui/routes"
import { HideOrDeleteAccountConfirmScreen } from "./HideOrDeleteAccountConfirmScreen"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"
import { clientAccountService } from "../../services/account"

export const HideOrDeleteAccountConfirmScreenContainer: FC = () => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)

  const routeAccount = useRouteWalletAccount()

  const { mode } = useParams<{ mode: "hide" | "delete" | "remove" }>()

  const handleSubmit = useCallback(async () => {
    if (!routeAccount) return

    if (mode === "hide") {
      await accountService.setHide(true, routeAccount.id)
    } else {
      await accountService.removeById(routeAccount.id)
    }

    const account =
      await clientAccountService.autoSelectAccountOnNetwork(selectedNetworkId)
    if (account) {
      navigate(routes.accounts())
    } else {
      /** no accounts, return to empty account screen */
      navigate(routes.accountTokens())
    }
  }, [mode, navigate, routeAccount, selectedNetworkId])

  const onReject = useNavigateBack()

  if (!routeAccount || !mode) {
    return null
  }

  return (
    <HideOrDeleteAccountConfirmScreen
      mode={mode}
      onSubmit={() => void handleSubmit()}
      onReject={onReject}
      accountId={routeAccount.id}
      accountName={routeAccount.name}
      accountAddress={routeAccount.address}
      accountType={routeAccount.type}
      networkId={routeAccount.networkId}
    />
  )
}
