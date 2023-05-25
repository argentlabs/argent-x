import { FC, useCallback, useMemo, useState } from "react"

import { accountService } from "../../../../shared/account/service"
import { waitForMessage } from "../../../../shared/messages"
import {
  removePreAuthorization,
  useIsPreauthorized,
} from "../../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { useAppState } from "../../../app.state"
import { approveAction } from "../../../services/backgroundActions"
import {
  selectedAccountView,
  visibleAccountsOnNetworkFamily,
} from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useActionScreen } from "../hooks/useActionScreen"
import { ConnectDappScreen } from "./ConnectDappScreen"

export const ConnectDappScreenContainer: FC = () => {
  const { action, onReject, closePopupIfLastAction } = useActionScreen()
  if (action.type !== "CONNECT_DAPP") {
    throw new Error(
      "ConnectDappScreenContainer used with incompatible action.type",
    )
  }
  const host = action.payload.host

  const { switcherNetworkId } = useAppState()
  const initiallySelectedAccount = useView(selectedAccountView)
  const visibleAccounts = useView(
    visibleAccountsOnNetworkFamily(switcherNetworkId),
  )
  const [connectedAccount, setConnectedAccount] = useState<
    BaseWalletAccount | undefined
  >(initiallySelectedAccount)
  const isConnected = useIsPreauthorized(host, initiallySelectedAccount)

  const selectedAccount = useMemo(() => {
    if (connectedAccount) {
      const account = visibleAccounts.find((account) =>
        accountsEqual(account, connectedAccount),
      )
      return account
    }
  }, [visibleAccounts, connectedAccount])

  const onSelectedAccountChange = useCallback((account: BaseWalletAccount) => {
    setConnectedAccount(account)
  }, [])

  const onConnect = useCallback(async () => {
    // selectedAccount && onConnectProp(selectedAccount)
    if (selectedAccount) {
      useAppState.setState({ isLoading: true })
      await accountService.select(selectedAccount)
      // continue with approval with selected account
      await approveAction(action)
      await waitForMessage("CONNECT_DAPP_RES")
      useAppState.setState({ isLoading: false })
    }
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction, selectedAccount])

  const onDisconnect = useCallback(async () => {
    if (selectedAccount) {
      await removePreAuthorization(action.payload.host, selectedAccount)
      await onReject()
    }
    closePopupIfLastAction()
  }, [action.payload.host, closePopupIfLastAction, onReject, selectedAccount])

  return (
    <ConnectDappScreen
      isConnected={isConnected}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onReject={onReject}
      host={host}
      accounts={visibleAccounts}
      selectedAccount={connectedAccount}
      onSelectedAccountChange={onSelectedAccountChange}
    />
  )
}
