import { useNavigateBack } from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { accountService } from "../../../shared/account/service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { useAccount } from "./accounts.state"
import { HideOrDeleteAccountConfirmScreen } from "./HideOrDeleteAccountConfirmScreen"
import { autoSelectAccountOnNetwork } from "./switchAccount"

export interface HideOrDeleteAccountConfirmScreenContainerProps {
  mode: "hide" | "delete"
}

export const HideOrDeleteAccountConfirmScreenContainer: FC<
  HideOrDeleteAccountConfirmScreenContainerProps
> = ({ mode }) => {
  const navigate = useNavigate()
  const { accountAddress = "" } = useParams<{ accountAddress?: string }>()
  // TODO: get rid of this global state after network views are implemented
  const { switcherNetworkId } = useAppState()

  const account = useAccount({
    address: accountAddress,
    networkId: switcherNetworkId,
  })

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
