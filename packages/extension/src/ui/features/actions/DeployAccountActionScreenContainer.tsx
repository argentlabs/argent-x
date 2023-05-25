import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { approveAction } from "../../services/backgroundActions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"

export const DeployAccountActionScreenContainer: FC = () => {
  const { action, closePopupIfLastAction, rejectAllActions } = useActionScreen()
  if (action.type !== "DEPLOY_ACCOUNT_ACTION") {
    throw new Error(
      "DeployAccountActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
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
  }, [account, action, closePopupIfLastAction, navigate])

  return (
    <WithArgentShieldVerified>
      <ApproveDeployAccountScreen
        actionHash={action.meta.hash}
        onSubmit={onSubmit}
        onReject={rejectAllActions}
        selectedAccount={account}
      />
    </WithArgentShieldVerified>
  )
}
