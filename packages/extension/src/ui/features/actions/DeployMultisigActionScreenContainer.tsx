import { isObject } from "lodash-es"
import { FC, useCallback, useState } from "react"

import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"
import { LedgerActionModal } from "./transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useLedgerForTransaction } from "./hooks/useLedgerForTransaction"
import { useDefaultFeeToken } from "./useDefaultFeeToken"
import { TokenWithBalance } from "@argent/x-shared"

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

  const defaultFeeToken = useDefaultFeeToken(selectedAccount)
  const [feeToken, setFeeToken] = useState<TokenWithBalance>(defaultFeeToken)

  const onSubmit = useCallback(async () => {
    const result = await approve({ feeTokenAddress: feeToken.address })
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      void closePopupIfLastAction()
    }
  }, [approve, closePopupIfLastAction, feeToken.address])

  const {
    disableLedgerApproval,
    isLedgerApprovalOpen,
    ledgerErrorMessage,
    onLedgerApprovalClose,
    onLedgerApprovalOpen,
    isLedgerSigner,
  } = useLedgerForTransaction(selectedAccount)

  const onSubmitWithLedger = async () => {
    onLedgerApprovalOpen()
    await onSubmit()
  }

  const onConfirm = () => {
    if (isLedgerSigner) {
      return onSubmitWithLedger()
    }
    return onSubmit()
  }

  return (
    <>
      <ApproveDeployAccountScreen
        actionHash={action.meta.hash}
        title={action.meta?.title}
        iconKey={action.meta?.icon}
        displayCalldata={action.payload.displayCalldata}
        onSubmit={onConfirm}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        isLedger={isLedgerSigner}
        disableLedgerApproval={disableLedgerApproval}
        feeToken={feeToken}
        setFeeToken={setFeeToken}
      />
      <LedgerActionModal
        isOpen={isLedgerApprovalOpen}
        onClose={onLedgerApprovalClose}
        onSubmit={onSubmit}
        errorMessage={ledgerErrorMessage}
        account={selectedAccount}
      />
    </>
  )
}
