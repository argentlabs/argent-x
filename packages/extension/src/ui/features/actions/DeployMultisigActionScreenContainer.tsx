import { isObject } from "lodash-es"
import { FC, useCallback } from "react"

import { useMultisig } from "../multisig/multisig.state"
import { useActionScreen } from "./hooks/useActionScreen"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"

export const DeployMultisigActionScreenContainer: FC = () => {
  const {
    action,
    approve,
    selectedAccount,
    closePopupIfLastAction,
    rejectAllActions,
  } = useActionScreen()
  if (action?.type !== "DEPLOY_MULTISIG") {
    throw new Error(
      "DeployMultisigActionScreenContainer used with incompatible action.type",
    )
  }
  const multisig = useMultisig(selectedAccount)
  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      if (isObject(result) && "txHash" in result) {
        multisig?.updateDeployTx(result.txHash)
      }
      void closePopupIfLastAction()
    }
  }, [approve, closePopupIfLastAction, multisig])

  return (
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
  )
}
