import { FC, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { removePreAuthorization } from "../../../shared/preAuthorizations"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { assertNever } from "../../services/assertNever"
import { connectAccount } from "../../services/backgroundAccounts"
import { approveAction, rejectAction } from "../../services/backgroundActions"
import { Account } from "../accounts/Account"
import { useAccounts, useSelectedAccount } from "../accounts/accounts.state"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { focusExtensionTab, useExtensionIsInTab } from "../browser/tabs"
import { useActions } from "./actions.state"
import { AddNetworkScreen } from "./AddNetworkScreen"
import { AddTokenScreen } from "./AddTokenScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConnectDappScreen } from "./connectDapp/ConnectDappScreen"

export const ActionScreen: FC = () => {
  const navigate = useNavigate()
  const account = useSelectedAccount()
  const extensionIsInTab = useExtensionIsInTab()
  const { actions } = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1

  const closePopupIfLastAction = useCallback(() => {
    if (EXTENSION_IS_POPUP && isLastAction) {
      window.close()
    }
  }, [isLastAction])

  const onSubmit = useCallback(async () => {
    approveAction(action)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  const onReject = useCallback(async () => {
    rejectAction(action)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  /** Focus the extension if it is running in a tab  */
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    init()
  }, [extensionIsInTab, action.type])

  switch (action.type) {
    case "CONNECT_DAPP":
      return (
        <ConnectDappScreen
          host={action.payload.host}
          onConnect={async (selectedAccount: Account) => {
            useAppState.setState({ isLoading: true })
            // switch UI to the account that was selected
            useAccounts.setState({
              selectedAccount,
            })
            // switch background wallet to the account that was selected
            connectAccount(selectedAccount)
            await waitForMessage("CONNECT_ACCOUNT_RES")
            // continue with approval with selected account
            approveAction(action)
            await waitForMessage("CONNECT_DAPP_RES")
            useAppState.setState({ isLoading: false })
            closePopupIfLastAction()
          }}
          onDisconnect={async (selectedAccount: Account) => {
            await removePreAuthorization({
              host: action.payload.host,
              accountAddress: selectedAccount.address,
            })
            rejectAction(action)
            closePopupIfLastAction()
          }}
          onReject={onReject}
        />
      )

    case "REQUEST_TOKEN":
      return (
        <AddTokenScreen
          defaultToken={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
        />
      )

    case "REQUEST_ADD_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
        />
      )

    case "REQUEST_SWITCH_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          mode="switch"
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
        />
      )

    case "TRANSACTION":
      return (
        <ApproveTransactionScreen
          transactions={action.payload.transactions}
          actionHash={action.meta.hash}
          onSubmit={async () => {
            analytics.track("signedTransaction", {
              networkId: account?.networkId || "unknown",
            })
            approveAction(action)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage(
                "TRANSACTION_SUBMITTED",
                ({ data }) => data.actionHash === action.meta.hash,
              ),
              waitForMessage(
                "TRANSACTION_FAILED",
                ({ data }) => data.actionHash === action.meta.hash,
              ),
            ])
            // (await) blocking as the window may closes afterwards
            await analytics.track("sentTransaction", {
              success: !("error" in result),
              networkId: account?.networkId || "unknown",
            })
            if ("error" in result) {
              useAppState.setState({
                error: `Sending transaction failed: ${result.error}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              closePopupIfLastAction()
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={onReject}
          selectedAccount={account}
        />
      )

    case "SIGN":
      return (
        <ApproveSignatureScreen
          dataToSign={action.payload}
          onSubmit={async () => {
            approveAction(action)
            useAppState.setState({ isLoading: true })
            await waitForMessage(
              "SIGNATURE_SUCCESS",
              ({ data }) => data.actionHash === action.meta.hash,
            )
            await analytics.track("signedMessage", {
              networkId: account?.networkId || "unknown",
            })
            closePopupIfLastAction()
            useAppState.setState({ isLoading: false })
          }}
          onReject={onReject}
          selectedAccount={account}
        />
      )

    default:
      assertNever(action)
      return <></>
  }
}
