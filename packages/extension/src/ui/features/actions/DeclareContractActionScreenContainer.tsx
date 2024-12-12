import { isObject } from "lodash-es"
import type { FC } from "react"
import { useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { TransactionType } from "starknet"
import { routes } from "../../../shared/ui/routes"
import { WithSmartAccountVerified } from "../smartAccount/WithSmartAccountVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { ApproveScreenType } from "./transaction/types"

/**
 * DeclareContractActionScreenContainer is a functional component that handles the UI and logic
 * for declaring a smart contract. It uses the useActionScreen hook to get the current action
 * and other necessary functions and state.
 * It is only used when the action type is DECLARE_CONTRACT.
 */
export const DeclareContractActionScreenContainer: FC = () => {
  const {
    action,
    approve,
    closePopupIfLastAction,
    selectedAccount,
    rejectAllActions,
  } = useActionScreen()
  if (action?.type !== "DECLARE_CONTRACT") {
    throw new Error(
      "DeclareContractActionScreenContainer used with incompatible action.type",
    )
  }
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      void closePopupIfLastAction()
      const { payload } = action
      navigate(
        routes.settingsSmartContractDeclareOrDeploySuccess(
          "declare",
          payload.classHash,
        ),
      )
    }
  }, [approve, closePopupIfLastAction, action, navigate])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <WithSmartAccountVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        actionErrorApproving={action.meta.errorApproving}
        transactionAction={{
          type: TransactionType.DECLARE,
          payload: action.payload,
        }}
        approveScreenType={ApproveScreenType.DECLARE}
        onSubmit={() => void onSubmit()}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
        showConfirmButton
      />
    </WithSmartAccountVerified>
  )
}
