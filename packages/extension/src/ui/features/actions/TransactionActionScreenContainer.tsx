import { isObject } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { getApproveScreenTypeFromAction } from "./utils"

export const TransactionActionScreenContainer: FC = () => {
  const {
    action,
    selectedAccount,
    approve,
    reject,
    rejectWithoutClose,
    closePopupIfLastAction,
  } = useActionScreen()
  if (action?.type !== "TRANSACTION") {
    throw new Error(
      "TransactionActionScreenContainer used with incompatible action.type",
    )
  }
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      closePopupIfLastAction()
      if (location.pathname === routes.swap()) {
        navigate(routes.accountActivity())
      }
    }
  }, [closePopupIfLastAction, navigate, approve])
  const approveScreenType = getApproveScreenTypeFromAction(action)
  return (
    <WithArgentShieldVerified transactions={action.payload.transactions}>
      <ApproveTransactionScreenContainer
        transactions={action.payload.transactions}
        actionHash={action.meta.hash}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        actionErrorApproving={action.meta.errorApproving}
        approveScreenType={approveScreenType}
        onSubmit={() => void onSubmit()}
        onReject={() => void reject()}
        onRejectWithoutClose={() => void rejectWithoutClose()}
        selectedAccount={selectedAccount}
      />
    </WithArgentShieldVerified>
  )
}
