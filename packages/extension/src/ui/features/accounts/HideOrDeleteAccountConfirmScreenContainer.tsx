import { useNavigateBack } from "@argent/x-ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { routes } from "../../../shared/ui/routes"
import { HideOrDeleteAccountConfirmScreen } from "./HideOrDeleteAccountConfirmScreen"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { HideOrDeleteAccountConfirmScreenContainerProps } from "./hideOrDeleteAccountConfirmScreen.model"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"

export const HideOrDeleteAccountConfirmScreenContainer: FC<
  HideOrDeleteAccountConfirmScreenContainerProps
> = ({ mode }) => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)

  const account = useRouteWalletAccount()
  const accountAddress = account?.address ?? ""

  const handleSubmit = useCallback(async () => {
    if (mode === "hide") {
      await accountService.setHide(true, {
        address: accountAddress,
        networkId: selectedNetworkId,
      })
    }
    if (mode === "delete") {
      await accountService.remove({
        address: accountAddress,
        networkId: selectedNetworkId,
      })
    }

    const account = await autoSelectAccountOnNetwork(selectedNetworkId)
    if (account) {
      navigate(routes.accounts())
    } else {
      /** no accounts, return to empty account screen */
      navigate(routes.accountTokens())
    }
  }, [accountAddress, mode, navigate, selectedNetworkId])

  const onReject = useNavigateBack()

  if (!account) {
    return null
  }

  return (
    <HideOrDeleteAccountConfirmScreen
      mode={mode}
      onSubmit={handleSubmit}
      onReject={onReject}
      accountName={account.name}
      accountAddress={account.address}
      networkId={account.networkId}
    />
  )
}
