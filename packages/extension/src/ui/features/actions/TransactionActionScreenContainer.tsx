import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { approveAction } from "../../services/backgroundActions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { getOriginatingHost } from "../browser/useOriginatingHost"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { getApproveScreenTypeFromAction } from "./utils"

export const TransactionActionScreenContainer: FC = () => {
  const { action, onReject, closePopupIfLastAction } = useActionScreen()
  if (action.type !== "TRANSACTION") {
    throw new Error(
      "TransactionActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
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
  }, [account?.networkId, action, closePopupIfLastAction, navigate])
  const approveScreenType = getApproveScreenTypeFromAction(action)
  return (
    <WithArgentShieldVerified transactions={action.payload.transactions}>
      <ApproveTransactionScreenContainer
        transactions={action.payload.transactions}
        actionHash={action.meta.hash}
        approveScreenType={approveScreenType}
        onSubmit={onSubmit}
        onReject={onReject}
        selectedAccount={account}
      />
    </WithArgentShieldVerified>
  )
}
