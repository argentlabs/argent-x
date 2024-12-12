import { isObject } from "lodash-es"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"

import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { useActionScreen } from "./hooks/useActionScreen"
import { LedgerActionModal } from "./transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useLedgerForTransaction } from "./hooks/useLedgerForTransaction"
import { useDefaultFeeToken } from "./useDefaultFeeToken"
import type { TokenWithBalance } from "@argent/x-shared"
import { classHashSupportsTxV3, isEqualAddress } from "@argent/x-shared"
import { useFeeTokenSelection } from "./transactionV2/useFeeTokenSelection"
import { useMaxAccountDeploymentFeeEstimation } from "./feeEstimation/utils"
import { useFeeTokenBalances } from "../accountTokens/useFeeTokenBalance"
import type { BaseToken } from "../../../shared/token/__new/types/token.model"
import { feeTokenService } from "../../services/feeToken"
import { num } from "starknet"
import { FeeEstimationContainer } from "./transactionV2/FeeEstimationContainer"
import { FeeTokenPickerModal } from "./feeEstimation/ui/FeeTokenPickerModal"
import { useView } from "../../views/implementation/react"
import { transactionHashFindAtom } from "../../views/transactionHashes"

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

  const defaultFeeToken = useDefaultFeeToken(selectedAccount)
  const [feeToken, setFeeToken] = useState<TokenWithBalance>(defaultFeeToken)

  const feeTokens = useFeeTokenBalances(selectedAccount)

  const [isFeeTokenSelectionReady, setIsFeeTokenSelectionReady] =
    useState(false)

  const { fee, error, loading } = useMaxAccountDeploymentFeeEstimation(
    selectedAccount,
    action.meta.hash,
    feeToken?.address,
  )
  const [isFeeTokenPickerOpen, setIsFeeTokenPickerOpen] = useState(false)

  useFeeTokenSelection({
    isFeeTokenSelectionReady,
    setIsFeeTokenSelectionReady,
    feeToken,
    setFeeToken,
    account: selectedAccount,
    fee,
    defaultFeeToken,
    feeTokens,
  })

  // For undeployed txV3 accounts, this will be true
  // For undeployed txV1 accounts, this needs to be false, as we don't want the user to deploy + upgrade from this screen
  const allowFeeTokenSelection = classHashSupportsTxV3(
    selectedAccount?.classHash,
  )

  const setPreferredFeeToken = useCallback(
    async ({ address }: BaseToken) => {
      await feeTokenService.preferFeeToken(address)
      const newFeeToken = feeTokens.find((token) =>
        isEqualAddress(token.address, address),
      )
      if (newFeeToken) {
        setFeeToken({
          ...newFeeToken,
          balance: num.toBigInt(newFeeToken.balance ?? 0),
        })
      }
      setIsFeeTokenPickerOpen(false)
    },
    [feeTokens, setFeeToken],
  )

  const txHash = useView(transactionHashFindAtom(action.meta.hash))

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

  const footer = useMemo(() => {
    if (!selectedAccount) {
      return null
    }

    return (
      <>
        {fee && feeToken && isFeeTokenSelectionReady && (
          <FeeEstimationContainer
            accountId={selectedAccount.id}
            transactionSimulationLoading={loading}
            error={error}
            fee={{ transactions: fee }}
            feeToken={feeToken}
            allowFeeTokenSelection={allowFeeTokenSelection}
            onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
            onErrorChange={setDisableConfirm}
          />
        )}

        <FeeTokenPickerModal
          isOpen={allowFeeTokenSelection && isFeeTokenPickerOpen}
          onClose={() => {
            setIsFeeTokenPickerOpen(false)
          }}
          tokens={feeTokens}
          onFeeTokenSelect={(token) => void setPreferredFeeToken(token)}
        />
      </>
    )
  }, [
    allowFeeTokenSelection,
    error,
    fee,
    feeToken,
    feeTokens,
    isFeeTokenPickerOpen,
    isFeeTokenSelectionReady,
    loading,
    selectedAccount,
    setPreferredFeeToken,
  ])

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
        feeToken={feeToken}
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
