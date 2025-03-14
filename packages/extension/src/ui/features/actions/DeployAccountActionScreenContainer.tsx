import { isObject } from "lodash-es"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"

import { WithSmartAccountVerified } from "../smartAccount/WithSmartAccountVerified"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"
import { useLedgerForTransaction } from "./hooks/useLedgerForTransaction"
import { LedgerActionModal } from "./transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useMaxAccountDeploymentFeeEstimation } from "./feeEstimation/utils"
import { FeeEstimationContainer } from "./transactionV2/FeeEstimationContainer"
import { useView } from "../../views/implementation/react"
import { transactionHashFindAtom } from "../../views/transactionHashes"
import { useNativeFeeToken } from "./useNativeFeeToken"

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

  const [disableConfirm, setDisableConfirm] = useState(true)

  // Manual deployment only supports native fee token
  // So we don't need the fee token selection logic
  const nativeFeeToken = useNativeFeeToken(selectedAccount)

  const { fee, error, loading } = useMaxAccountDeploymentFeeEstimation(
    selectedAccount,
    action.meta.hash,
    nativeFeeToken.address,
  )

  const txHash = useView(transactionHashFindAtom(action.meta.hash))

  const onSubmit = useCallback(async () => {
    const result = await approve({ feeTokenAddress: nativeFeeToken.address })
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      void closePopupIfLastAction()
    }
  }, [approve, closePopupIfLastAction, nativeFeeToken.address])

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

  const footer = useMemo(() => {
    if (!selectedAccount) {
      return null
    }

    return (
      <>
        {fee && nativeFeeToken && (
          <FeeEstimationContainer
            accountId={selectedAccount.id}
            transactionSimulationLoading={loading}
            error={error}
            fee={{ type: "native", transactions: fee }}
            feeToken={nativeFeeToken}
            allowFeeTokenSelection={false}
            onErrorChange={setDisableConfirm}
          />
        )}
      </>
    )
  }, [error, fee, loading, nativeFeeToken, selectedAccount])

  return (
    <WithSmartAccountVerified>
      <ApproveDeployAccountScreen
        actionHash={action.meta.hash}
        title={action.meta?.title}
        iconKey={action.meta?.icon}
        displayCalldata={action.payload.displayCalldata}
        onSubmit={() => void onConfirm()}
        onReject={() => void rejectAllActions()}
        isLedger={isLedgerSigner}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        disableLedgerApproval={disableLedgerApproval}
        feeToken={nativeFeeToken}
        footer={footer}
        disableConfirm={disableConfirm}
      />
      <LedgerActionModal
        isOpen={isLedgerApprovalOpen}
        onClose={onLedgerApprovalClose}
        onSubmit={onSubmit}
        errorMessage={ledgerErrorMessage}
        account={selectedAccount}
        txHash={txHash}
      />
    </WithSmartAccountVerified>
  )
}
