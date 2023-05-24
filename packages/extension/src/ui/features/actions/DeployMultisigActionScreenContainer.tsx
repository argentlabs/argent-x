import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { approveAction } from "../../services/backgroundActions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useMultisig } from "../multisig/multisig.state"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveDeployMultisig } from "./transaction/ApproveDeployMultisig"

export const DeployMultisigActionScreenContainer: FC = () => {
  const { action, closePopupIfLastAction, rejectAllActions } = useActionScreen()
  if (action.type !== "DEPLOY_MULTISIG_ACTION") {
    throw new Error(
      "DeployMultisigActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const multisig = useMultisig(account)
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
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
  }, [account?.networkId, action, closePopupIfLastAction, multisig, navigate])

  return (
    <ApproveDeployMultisig
      actionHash={action.meta.hash}
      onSubmit={onSubmit}
      onReject={rejectAllActions}
      selectedAccount={multisig}
    />
  )
}
