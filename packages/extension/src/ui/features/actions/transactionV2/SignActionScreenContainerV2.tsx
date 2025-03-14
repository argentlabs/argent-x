import type { FC } from "react"
import { useCallback, useEffect, useMemo } from "react"
import { getErrorMessageAndLabelFromSimulation } from "@argent/x-shared/simulation"
import { ActionScreenErrorFooter, Label } from "@argent/x-ui"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { WithSmartAccountVerified } from "../../smartAccount/WithSmartAccountVerified"
import { useDappDisplayAttributes } from "../../../services/knownDapps/useDappDisplayAttributes"
import { ExecuteFromOutsideScreen } from "../ExecuteFromOutsideScreen"
import { useActionScreen } from "../hooks/useActionScreen"
import { SignActionScreenV2 } from "./SignActionScreenV2"
import { useSignatureReview } from "./useTransactionReviewV2"
import { ampli } from "../../../../shared/analytics"
import { LedgerActionModal } from "../transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useLedgerForTransaction } from "../hooks/useLedgerForTransaction"
import { useView } from "../../../views/implementation/react"
import {
  isSignerInMultisigView,
  multisigView,
} from "../../multisig/multisig.state"
import useValidateOutsideExecution from "../transaction/executeFromOutside/useValidateOutsideExecution"
import { transactionHashFindAtom } from "../../../views/transactionHashes"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { validateSignatureChainId } from "../../../../shared/utils/validateSignatureChainId"
import { useNativeFeeToken } from "../useNativeFeeToken"

export const SignActionScreenContainerV2: FC = () => {
  const {
    action,
    selectedAccount,
    approve,
    approveAndClose,
    reject,
    rejectWithoutClose,
    clearLastActionError,
    updateTransactionReview,
  } = useActionScreen()
  if (action?.type !== "SIGN") {
    throw new Error(
      "SignActionScreenContainer used with incompatible action.type",
    )
  }

  const navigate = useNavigate()
  const multisig = useView(multisigView(selectedAccount))
  const signerIsInMultisig = useView(isSignerInMultisigView(selectedAccount))

  const host = action.meta.origin || ""
  const dappDisplayAttributes = useDappDisplayAttributes(host)
  const feeToken = useNativeFeeToken(selectedAccount)
  const dataToSign = action.payload.typedData
  const {
    data: review,
    error,
    isValidating,
  } = useSignatureReview({
    dataToSign: dataToSign,
    feeTokenAddress: feeToken.address,
    appDomain: action.meta.origin,
  })
  const isOutsideExecution =
    dataToSign.domain.name === "Account.execute_from_outside"

  const isValidOutsideExecution = useValidateOutsideExecution(
    action.payload.typedData,
    host,
    selectedAccount?.network,
  )

  const {
    isLedgerApprovalOpen,
    onLedgerApprovalOpen,
    onLedgerApprovalClose,
    isLedgerSigner,
    ledgerErrorMessage,
    disableLedgerApproval,
  } = useLedgerForTransaction(selectedAccount)

  const txHash = useView(transactionHashFindAtom(action.meta.hash))

  const onSubmit = useCallback(async () => {
    if (isLedgerSigner) {
      await clearLastActionError()
      onLedgerApprovalOpen()
    }

    if (multisig && multisig.threshold > 1) {
      await approve()
      return navigate(routes.multisigOffchainSignatureWarning())
    }
    ampli.messageSigned({
      host: action.meta.origin || "",
      "from outside": isOutsideExecution,
      "wallet platform": "browser extension",
    })

    return approveAndClose()
  }, [
    isLedgerSigner,
    multisig,
    action.meta.origin,
    isOutsideExecution,
    approveAndClose,
    clearLastActionError,
    onLedgerApprovalOpen,
    approve,
    navigate,
  ])

  useEffect(() => {
    void updateTransactionReview(review)
  }, [review, updateTransactionReview])

  const transactionReviewSimulationError = useMemo(() => {
    const errorMessageAndLabel = getErrorMessageAndLabelFromSimulation(review)
    if (!errorMessageAndLabel) {
      return null
    }
    const { label, message } = errorMessageAndLabel

    return (
      <ActionScreenErrorFooter
        title={<Label prefix="Tx not executed:" label={label} />}
        errorMessage={message}
      />
    )
  }, [review])

  const invalidChainIdError = useMemo(() => {
    if (!selectedAccount) {
      return null
    }

    const validateSignatureChainIdResult = validateSignatureChainId(
      selectedAccount,
      dataToSign,
    )

    if (validateSignatureChainIdResult.success) {
      return null
    }

    return (
      <ActionScreenErrorFooter
        title={validateSignatureChainIdResult.error}
        errorMessage={validateSignatureChainIdResult.error}
      />
    )
  }, [dataToSign, selectedAccount])

  if (multisig && !signerIsInMultisig) {
    return (
      <RemovedMultisigWarningScreen
        onReject={() => void rejectWithoutClose()}
      />
    )
  }

  if (isOutsideExecution && !isValidOutsideExecution) {
    return (
      <ExecuteFromOutsideScreen
        selectedAccount={selectedAccount}
        onReject={() => void reject()}
      />
    )
  }

  const confirmButtonDisabled = disableLedgerApproval

  const signatureReview = transactionReviewSimulationError ? undefined : review // If we have simulation errors, fallback to the normal signature screen
  const footer = transactionReviewSimulationError || invalidChainIdError || (
    <WithActionScreenErrorFooter />
  )

  return (
    <WithSmartAccountVerified>
      <SignActionScreenV2
        title={
          isOutsideExecution ? "Review transaction intent" : action.meta.title
        }
        subtitle={action.meta.origin}
        dappLogoUrl={dappDisplayAttributes.iconUrl}
        dappHost={action.meta.origin || ""}
        dataToSign={dataToSign}
        onSubmit={() => void onSubmit()}
        onReject={() => void reject()}
        actionIsApproving={Boolean(action.meta.startedApproving)}
        review={signatureReview}
        networkId={selectedAccount?.network.id || ""}
        error={error}
        isValidating={isValidating}
        confirmButtonDisabled={confirmButtonDisabled}
        isLedger={isLedgerSigner}
        footer={footer}
      />
      <LedgerActionModal
        isOpen={isLedgerApprovalOpen}
        onClose={onLedgerApprovalClose}
        onSubmit={onSubmit}
        errorMessage={ledgerErrorMessage}
        account={selectedAccount}
        actionType="signature"
        txHash={txHash}
      />
    </WithSmartAccountVerified>
  )
}
