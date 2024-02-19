import { isObject } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { ApproveScreenType } from "./transaction/types"
import { TransactionType } from "starknet"

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

  return (
    <WithArgentShieldVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        actionErrorApproving={action.meta.errorApproving}
        transactionAction={{
          type: TransactionType.DECLARE,
          payload: action.payload,
        }}
        approveScreenType={ApproveScreenType.DECLARE}
        onSubmit={onSubmit}
        onReject={rejectAllActions}
        selectedAccount={selectedAccount}
      />
    </WithArgentShieldVerified>
  )
}
