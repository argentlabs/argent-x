import { FC, useCallback, useMemo, useState } from "react"

import {
  removePreAuthorization,
  useIsPreauthorized,
} from "../../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { useAppState } from "../../../app.state"
import { visibleAccountsOnNetworkFamily } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { useActionScreen } from "../hooks/useActionScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { ConnectDappScreen } from "./ConnectDappScreen"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"
import { useDisclosure } from "@chakra-ui/react"
import { NavigationBar } from "@argent/ui"
import { NetworkSwitcherContainer } from "../../networks/NetworkSwitcher/NetworkSwitcherContainer"
import { clientAccountService } from "../../../services/account"

export const ConnectDappScreenContainer: FC = () => {
  const {
    action,
    selectedAccount: initiallySelectedAccount,
    approveAndClose,
    reject,
  } = useActionScreen()
  if (action?.type !== "CONNECT_DAPP") {
    throw new Error(
      "ConnectDappScreenContainer used with incompatible action.type",
    )
  }
  const host = action.payload.host

  const { switcherNetworkId } = useAppState()
  const visibleAccounts = useView(
    visibleAccountsOnNetworkFamily(switcherNetworkId),
  )
  const [connectedAccount, setConnectedAccount] = useState<
    BaseWalletAccount | undefined
  >(initiallySelectedAccount)
  const isConnected = useIsPreauthorized(host, initiallySelectedAccount)

  const dappDisplayAttributes = useDappDisplayAttributes(host)

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
    if (selectedAccount) {
      // continue with approval with selected account
      await clientAccountService.select(selectedAccount)
    }
    await approveAndClose()
  }, [approveAndClose, selectedAccount])

  const onDisconnect = useCallback(async () => {
    if (selectedAccount) {
      await removePreAuthorization(action.payload.host, selectedAccount)
    }
    await reject()
  }, [action.payload.host, reject, selectedAccount])

  const networkNavigationBar = (
    <NavigationBar
      rightButton={
        <NetworkSwitcherContainer
          disabled
          _disabled={{ opacity: 1 }}
          cursor="auto"
          _hover={{}}
          _active={{}}
        />
      }
      py="3"
      px="4"
    />
  )

  return (
    <ConnectDappScreen
      isConnected={isConnected}
      onConnect={() => void onConnect()}
      onDisconnect={() => void onDisconnect()}
      onReject={() => void reject()}
      host={host}
      accounts={visibleAccounts}
      dappDisplayAttributes={dappDisplayAttributes}
      selectedAccount={connectedAccount}
      onSelectedAccountChange={onSelectedAccountChange}
      actionIsApproving={Boolean(action.meta.startedApproving)}
      navigationBar={networkNavigationBar}
      footer={<WithActionScreenErrorFooter />}
    />
  )
}
