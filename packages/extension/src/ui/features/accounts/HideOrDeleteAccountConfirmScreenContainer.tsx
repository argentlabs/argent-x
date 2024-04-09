import { useNavigateBack } from "@argent/x-ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { HideOrDeleteAccountConfirmScreen } from "./HideOrDeleteAccountConfirmScreen"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { useRouteAccount } from "../shield/useRouteAccount"
import { HideOrDeleteAccountConfirmScreenContainerProps } from "./hideOrDeleteAccountConfirmScreen.model"

export const HideOrDeleteAccountConfirmScreenContainer: FC<
  HideOrDeleteAccountConfirmScreenContainerProps
> = ({ mode }) => {
  const navigate = useNavigate()
  // TODO: get rid of this global state after network views are implemented
  const { switcherNetworkId } = useAppState()

  const account = useRouteAccount()
  const accountAddress = account?.address ?? ""

  const handleSubmit = useCallback(async () => {
    if (mode === "hide") {
      await accountService.setHide(true, {
        address: accountAddress,
        networkId: switcherNetworkId,
      })
    }
    if (mode === "delete") {
      await accountService.remove({
        address: accountAddress,
        networkId: switcherNetworkId,
      })
    }

    const account = await autoSelectAccountOnNetwork(switcherNetworkId)
    if (account) {
      navigate(routes.accounts())
    } else {
      /** no accounts, return to empty account screen */
      navigate(routes.accountTokens())
    }
  }, [accountAddress, mode, navigate, switcherNetworkId])

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
    />
  )
}
