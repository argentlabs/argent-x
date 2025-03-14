import { isObject } from "lodash-es"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"

import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"
import { LedgerActionModal } from "./transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useLedgerForTransaction } from "./hooks/useLedgerForTransaction"
import { useMaxAccountDeploymentFeeEstimation } from "./feeEstimation/utils"
import { FeeEstimationContainer } from "./transactionV2/FeeEstimationContainer"
import { useView } from "../../views/implementation/react"
import { transactionHashFindAtom } from "../../views/transactionHashes"
import { useNativeFeeToken } from "./useNativeFeeToken"

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

  const [disableConfirm, setDisableConfirm] = useState(true)

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
    <>
      <ApproveDeployAccountScreen
        actionHash={action.meta.hash}
        title={action.meta?.title}
        iconKey={action.meta?.icon}
        displayCalldata={action.payload.displayCalldata}
        onSubmit={() => void onConfirm()}
        onReject={() => void rejectAllActions()}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        isLedger={isLedgerSigner}
        disableLedgerApproval={disableLedgerApproval}
        disableConfirm={disableConfirm}
        feeToken={nativeFeeToken}
        footer={footer}
      />
      <LedgerActionModal
        isOpen={isLedgerApprovalOpen}
        onClose={onLedgerApprovalClose}
        onSubmit={onSubmit}
        errorMessage={ledgerErrorMessage}
        account={selectedAccount}
        txHash={txHash}
      />
    </>
  )
}
