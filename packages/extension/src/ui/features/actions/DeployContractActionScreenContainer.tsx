import { isObject } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveTransactionScreenContainer } from "./transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { ApproveScreenType } from "./transaction/types"

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
  const navigate = useNavigate()
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      void closePopupIfLastAction()
      if (isObject(result) && "deployedContractAddress" in result) {
        navigate(
          routes.settingsSmartContractDeclareOrDeploySuccess(
            "deploy",
            result.deployedContractAddress,
          ),
        )
      }
    }
  }, [approve, closePopupIfLastAction, navigate])

  return (
    <WithArgentShieldVerified>
      <ApproveTransactionScreenContainer
        actionHash={action.meta.hash}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        actionErrorApproving={action.meta.errorApproving}
        approveScreenType={ApproveScreenType.DEPLOY}
        transactions={[]}
        onSubmit={() => void onSubmit()}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
      />
    </WithArgentShieldVerified>
  )
}
