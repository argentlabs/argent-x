import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { approveAction } from "../../services/backgroundActions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { ApproveScreenType } from "./transaction/types"

export const DeployContractActionScreenContainer: FC = () => {
  const { action, closePopupIfLastAction, rejectAllActions } = useActionScreen()
  if (action.type !== "DEPLOY_CONTRACT_ACTION") {
    throw new Error(
      "DeployContractActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
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
  }, [account?.networkId, action, closePopupIfLastAction, navigate])

  return (
    <WithArgentShieldVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        approveScreenType={ApproveScreenType.DEPLOY}
        transactions={[]}
        onSubmit={onSubmit}
        onReject={rejectAllActions}
        selectedAccount={account}
      />
    </WithArgentShieldVerified>
  )
}
