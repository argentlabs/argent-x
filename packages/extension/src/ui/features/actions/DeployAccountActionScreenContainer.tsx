import { isObject } from "lodash-es"
import { FC, useCallback } from "react"

import { useAccount } from "../accounts/accounts.state"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"

export const DeployAccountActionScreenContainer: FC = () => {
  const {
    action,
    approve,
    closePopupIfLastAction,
    selectedAccount,
    rejectAllActions,
  } = useActionScreen()
  if (action?.type !== "DEPLOY_ACCOUNT") {
    throw new Error(
      "DeployAccountActionScreenContainer used with incompatible action.type",
    )
  }
  const accountWithDeployState = useAccount(selectedAccount)
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      if (isObject(result) && "txHash" in result) {
        accountWithDeployState?.updateDeployTx(result.txHash)
      }
      void closePopupIfLastAction()
    }
  }, [approve, closePopupIfLastAction, accountWithDeployState])

  return (
    <WithArgentShieldVerified>
      <ApproveDeployAccountScreen
        actionHash={action.meta.hash}
        title={action.meta?.title}
        iconKey={action.meta?.icon}
        displayCalldata={action.payload.displayCalldata}
        onSubmit={() => void onSubmit()}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
      />
    </WithArgentShieldVerified>
  )
}
