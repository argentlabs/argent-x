import { FC, useCallback, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { removePreAuthorization } from "../../../shared/preAuthorizations"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { assertNever } from "../../services/assertNever"
import { selectAccount } from "../../services/backgroundAccounts"
import { approveAction, rejectAction } from "../../services/backgroundActions"
import { Account } from "../accounts/Account"
import { useSelectedAccount } from "../accounts/accounts.state"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { focusExtensionTab, useExtensionIsInTab } from "../browser/tabs"
import { getOriginatingHost } from "../browser/useOriginatingHost"
import { useMultisig } from "../multisig/multisig.state"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActions } from "./actions.state"
import { AddNetworkScreen } from "./AddNetworkScreen"
import { AddTokenScreen } from "./AddTokenScreen"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ConnectDappScreen } from "./connectDapp/ConnectDappScreen"
import { ApproveDeployMultisig } from "./transaction/ApproveDeployMultisig"
import { ApproveTransactionScreen } from "./transaction/ApproveTransactionScreen"
import { ApproveScreenType } from "./transaction/types"
import { getApproveScreenType } from "./utils"

export const ActionScreen: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const account = useSelectedAccount()
  const multisig = useMultisig(account)
  const extensionIsInTab = useExtensionIsInTab()
  const actions = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1

  const closePopup = useCallback(() => {
    if (EXTENSION_IS_POPUP) {
      window.close()
    }
  }, [])
  const closePopupIfLastAction = useCallback(() => {
    if (isLastAction) {
      closePopup()
    }
  }, [closePopup, isLastAction])

  const onSubmit = useCallback(async () => {
    await approveAction(action)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  const onReject = useCallback(async () => {
    await analytics.track("rejectedTransaction", {
      networkId: account?.networkId || "unknown",
      host: await getOriginatingHost(),
    })
    await rejectAction(action.meta.hash)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction, account?.networkId])

  const rejectAllActions = useCallback(async () => {
    await rejectAction(actions.map((act) => act.meta.hash))
    closePopup()
  }, [actions, closePopup])

  /** Focus the extension if it is running in a tab  */
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    init()
  }, [extensionIsInTab, action?.type])

  switch (action?.type) {
    case "CONNECT_DAPP":
      return (
        <ConnectDappScreen
          host={action.payload.host}
          onConnect={async (selectedAccount: Account) => {
            useAppState.setState({ isLoading: true })
            selectAccount(selectedAccount)
            // continue with approval with selected account
            await approveAction(action)
            await waitForMessage("CONNECT_DAPP_RES")
            useAppState.setState({ isLoading: false })
            closePopupIfLastAction()
          }}
          onDisconnect={async (selectedAccount: Account) => {
            await removePreAuthorization(action.payload.host, selectedAccount)
            await rejectAction(action.meta.hash)
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
          mode="add"
        />
      )

    case "REQUEST_SWITCH_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
          mode="switch"
        />
      )

    case "TRANSACTION":
      return (
        <WithArgentShieldVerified transactions={action.payload.transactions}>
          <ApproveTransactionScreen
            transactions={action.payload.transactions}
            actionHash={action.meta.hash}
            approveScreenType={getApproveScreenType(action)}
            onSubmit={async () => {
              analytics.track("signedTransaction", {
                networkId: account?.networkId || "unknown",
                host: await getOriginatingHost(),
              })
              await approveAction(action)
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
                host: await getOriginatingHost(),
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
                if (location.pathname === routes.swap()) {
                  navigate(routes.accountActivity())
                }
              }
            }}
            onReject={onReject}
            selectedAccount={account}
          />
        </WithArgentShieldVerified>
      )

    case "DEPLOY_ACCOUNT_ACTION":
      return (
        <WithArgentShieldVerified>
          <ApproveDeployAccountScreen
            actionHash={action.meta.hash}
            onSubmit={async () => {
              analytics.track("signedTransaction", {
                networkId: account?.networkId || "unknown",
              })
              await approveAction(action)
              useAppState.setState({ isLoading: true })
              const result = await Promise.race([
                waitForMessage(
                  "DEPLOY_ACCOUNT_ACTION_SUBMITTED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
                waitForMessage(
                  "DEPLOY_ACCOUNT_ACTION_FAILED",
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
                if ("txHash" in result) {
                  account?.updateDeployTx(result.txHash)
                }
                closePopupIfLastAction()
                useAppState.setState({ isLoading: false })
              }
            }}
            onReject={rejectAllActions}
            selectedAccount={account}
          />
        </WithArgentShieldVerified>
      )

    case "DEPLOY_MULTISIG_ACTION":
      return (
        <ApproveDeployMultisig
          actionHash={action.meta.hash}
          onSubmit={async () => {
            analytics.track("signedTransaction", {
              networkId: account?.networkId || "unknown",
            })
            await approveAction(action)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage(
                "DEPLOY_MULTISIG_ACTION_SUBMITTED",
                ({ data }) => data.actionHash === action.meta.hash,
              ),
              waitForMessage(
                "DEPLOY_MULTISIG_ACTION_FAILED",
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
              if ("txHash" in result) {
                multisig?.updateDeployTx(result.txHash)
              }
              closePopupIfLastAction()
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={rejectAllActions}
          selectedAccount={multisig}
        />
      )

    case "SIGN":
      return (
        <WithArgentShieldVerified>
          <ApproveSignatureScreen
            dataToSign={action.payload}
            onSubmit={async () => {
              await approveAction(action)
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
        </WithArgentShieldVerified>
      )
    case "DECLARE_CONTRACT_ACTION":
      return (
        <WithArgentShieldVerified>
          <ApproveTransactionScreen
            actionHash={action.meta.hash}
            transactions={[]}
            approveScreenType={ApproveScreenType.DECLARE}
            onSubmit={async () => {
              analytics.track("signedDeclareTransaction", {
                networkId: account?.networkId || "unknown",
              })
              await approveAction(action)
              useAppState.setState({ isLoading: true })
              const result = await Promise.race([
                waitForMessage(
                  "DECLARE_CONTRACT_ACTION_SUBMITTED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
                waitForMessage(
                  "DECLARE_CONTRACT_ACTION_FAILED",
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
                navigate(
                  routes.settingsSmartContractDeclareOrDeploySuccess(
                    "declare",
                    action.payload.classHash,
                  ),
                )
              }
            }}
            onReject={rejectAllActions}
            selectedAccount={account}
          />
        </WithArgentShieldVerified>
      )
    case "DEPLOY_CONTRACT_ACTION":
      return (
        <WithArgentShieldVerified>
          <ApproveTransactionScreen
            actionHash={action.meta.hash}
            approveScreenType={ApproveScreenType.DEPLOY}
            transactions={[]}
            onSubmit={async () => {
              analytics.track("signedDeployTransaction", {
                networkId: account?.networkId || "unknown",
              })
              await approveAction(action)
              useAppState.setState({ isLoading: true })
              const result = await Promise.race([
                waitForMessage(
                  "DEPLOY_CONTRACT_ACTION_SUBMITTED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
                waitForMessage(
                  "DEPLOY_CONTRACT_ACTION_FAILED",
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
                navigate(
                  routes.settingsSmartContractDeclareOrDeploySuccess(
                    "deploy",
                    result.deployedContractAddress,
                  ),
                )
              }
            }}
            onReject={rejectAllActions}
            selectedAccount={account}
          />
        </WithArgentShieldVerified>
      )

    default:
      assertNever(action)
      return <></>
  }
}
