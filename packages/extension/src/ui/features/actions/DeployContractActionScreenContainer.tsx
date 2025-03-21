import { isObject } from "lodash-es"
import type { FC } from "react"
import { useCallback } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { WithSmartAccountVerified } from "../smartAccount/WithSmartAccountVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { ApproveScreenType } from "./transaction/types"
import { TransactionType } from "starknet"

export const DeployContractActionScreenContainer: FC = () => {
  const {
    action,
    approve,
    selectedAccount,
    closePopupIfLastAction,
    rejectAllActions,
  } = useActionScreen()
  if (action?.type !== "DEPLOY_CONTRACT") {
    throw new Error(
      "DeployContractActionScreenContainer used with incompatible action.type",
    )
  }
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      void closePopupIfLastAction()
    }
  }, [approve, closePopupIfLastAction])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <WithSmartAccountVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        actionErrorApproving={action.meta.errorApproving}
        approveScreenType={ApproveScreenType.DEPLOY}
        transactionAction={{
          type: TransactionType.DEPLOY,
          payload: action.payload,
        }}
        onSubmit={() => void onSubmit()}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
        showConfirmButton
      />
    </WithSmartAccountVerified>
  )
}
