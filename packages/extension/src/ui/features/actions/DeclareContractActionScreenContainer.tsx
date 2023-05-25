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

export const DeclareContractActionScreenContainer: FC = () => {
  const { action, closePopupIfLastAction, rejectAllActions } = useActionScreen()
  if (action.type !== "DECLARE_CONTRACT_ACTION") {
    throw new Error(
      "DeclareContractActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
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
  }, [account?.networkId, action, closePopupIfLastAction, navigate])

  return (
    <WithArgentShieldVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        transactions={[]}
        approveScreenType={ApproveScreenType.DECLARE}
        onSubmit={onSubmit}
        onReject={rejectAllActions}
        selectedAccount={account}
      />
    </WithArgentShieldVerified>
  )
}
