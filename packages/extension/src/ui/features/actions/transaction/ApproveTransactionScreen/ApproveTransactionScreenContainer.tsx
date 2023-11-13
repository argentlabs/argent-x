import { useDisclosure } from "@chakra-ui/react"
import { useAtom } from "jotai"
import { isArray, isEmpty, isFunction } from "lodash-es"
import { FC, useCallback, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Call } from "starknet"

import { getDisplayWarnAndReasonForTransactionReview } from "../../../../../shared/transactionReview.service"
import { routes } from "../../../../routes"
import { userClickedAddFundsAtom } from "../../../../views/actions"
import { RemovedMultisigWarningScreen } from "../../../multisig/RemovedMultisigWarningScreen"
import { useIsSignerInMultisig } from "../../../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../../../multisig/multisig.state"
import { useMultisigPendingTransactionsByAccount } from "../../../multisig/multisigTransactions.state"
import { useIsMainnet } from "../../../networks/hooks/useIsMainnet"
import { CombinedFeeEstimationContainer } from "../../feeEstimation/CombinedFeeEstimationContainer"
import { FeeEstimationContainer } from "../../feeEstimation/FeeEstimationContainer"
import { ApproveScreenType, TransactionActionsType } from "../types"
import { useTransactionReview } from "../useTransactionReview"
import { useAggregatedSimData } from "../useTransactionSimulatedData"
import { useTransactionSimulation } from "../useTransactionSimulation"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { MultisigBannerProps } from "./MultisigBanner"
import { useEstimatedFees } from "../../feeEstimation/useEstimatedFees"
import { WithActionScreenErrorFooter } from "./WithActionScreenErrorFooter"
import { ApproveTransactionScreenContainerProps } from "./approveTransactionScreen.model"
import { ensureArray } from "@argent/shared"

const VERIFIED_DAPP_ENABLED = process.env.FEATURE_VERIFIED_DAPPS === "true"

export const ApproveTransactionScreenContainer: FC<
  ApproveTransactionScreenContainerProps
> = ({
  actionHash,
  actionIsApproving,
  actionErrorApproving,
  selectedAccount,
  transactions,
  onReject,
  onSubmit,
  onConfirmAnyway,
  onRejectWithoutClose,
  approveScreenType,
  multisigBannerProps,
  multisigModalDisclosure: providedMultisigModalDisclosure,
  transactionContext = "STANDARD_EXECUTE",
  ...rest
}) => {
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [showTxDetails, setShowTxDetails] = useState(false)
  const [userClickedAddFunds, setUserClickedAddFunds] = useAtom(
    userClickedAddFundsAtom,
  )
  const isMainnet = useIsMainnet()
  const multisig = useMultisig(selectedAccount)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const navigate = useNavigate()

  const { data: transactionReview } = useTransactionReview({
    account: selectedAccount,
    transactions,
    actionHash,
  })

  const {
    data: transactionSimulation,
    isValidating: isSimulationValidating,
    error: transactionSimulationError,
  } = useTransactionSimulation({
    account: selectedAccount,
    transactions,
    actionHash,
  })

  const simulationEstimatedFee = useEstimatedFees(transactions)

  const multisigModalDisclosure = useDisclosure()

  const isSimulationLoading = isSimulationValidating && !transactionSimulation

  const aggregatedData = useAggregatedSimData(transactionSimulation)

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(selectedAccount)

  // This is required because when a new transaction is added through the normal flow
  // we check for any other pending transactions and if there are any we show the modal
  // If the container is called for adding signature to already pending transaction,
  // we check for any other pending transactions and if there are any we show the modal
  // This makes the transaction context important
  const hasPendingMultisigTransactions =
    transactionContext === "STANDARD_EXECUTE"
      ? pendingMultisigTransactions.length > 0
      : pendingMultisigTransactions.length > 1

  const verifiedDapp =
    (VERIFIED_DAPP_ENABLED && isMainnet && transactionReview?.targetedDapp) ||
    undefined

  const onShowAddFunds = useCallback(
    (hasInsufficientFunds: boolean) => {
      if (!hasInsufficientFunds) {
        setUserClickedAddFunds(false)
      }
      if (hasInsufficientFunds && !userClickedAddFunds) {
        setDisableConfirm(false)
      }
      setHasInsufficientFunds(hasInsufficientFunds)
    },
    [setUserClickedAddFunds, userClickedAddFunds],
  )

  const onSubmitAction = (transactions: Call | Call[]) => {
    if (hasInsufficientFunds) {
      navigate(routes.funding(), { state: { showOnTop: true } })
      setUserClickedAddFunds(true)
      setHasInsufficientFunds(false)
      setDisableConfirm(true)
    } else {
      onSubmit(transactions)
    }
  }

  const onRejectAction = () => {
    setUserClickedAddFunds(false)
    if (isFunction(onReject)) {
      onReject()
    }
  }

  const transactionsArray: Call[] = useMemo(
    () => (isArray(transactions) ? transactions : [transactions]),
    [transactions],
  )

  const txnHasTransfers = useMemo(
    () =>
      ensureArray(transactionSimulation).some((txn) => !isEmpty(txn.transfers)),
    [transactionSimulation],
  )

  const txnHasApprovals = useMemo(
    () =>
      ensureArray(transactionSimulation).some((txn) => !isEmpty(txn.approvals)),
    [transactionSimulation],
  )

  const isUdcAction = useMemo(
    () =>
      approveScreenType === ApproveScreenType.DECLARE ||
      approveScreenType === ApproveScreenType.DEPLOY,
    [approveScreenType],
  )

  const isChangeGuardianTx = useMemo(
    () =>
      approveScreenType === ApproveScreenType.ADD_ARGENT_SHIELD ||
      approveScreenType === ApproveScreenType.REMOVE_ARGENT_SHIELD,
    [approveScreenType],
  )

  const transactionActionsType: TransactionActionsType | undefined =
    useMemo(() => {
      if (!selectedAccount) {
        return
      }

      if (approveScreenType === ApproveScreenType.ADD_ARGENT_SHIELD) {
        return {
          type: "ADD_ARGENT_SHIELD",
          payload: {
            accountAddress: selectedAccount.address,
          },
        }
      }

      if (approveScreenType === ApproveScreenType.REMOVE_ARGENT_SHIELD) {
        return {
          type: "REMOVE_ARGENT_SHIELD",
          payload: {
            accountAddress: selectedAccount.address,
          },
        }
      }

      return {
        type: "INVOKE_FUNCTION",
        payload: transactionsArray,
      }
    }, [approveScreenType, selectedAccount, transactionsArray])

  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)

  // Show balance change if there is a transaction simulation and there are approvals or transfers
  const hasBalanceChange = Boolean(
    transactionSimulation && (txnHasTransfers || txnHasApprovals),
  )

  const showTransactionActions = useMemo(
    // Show actions if there is no balance change or if there is a balance change and the user has expanded the details
    () =>
      (!isUdcAction && !hasBalanceChange) ||
      (showTxDetails && hasBalanceChange),
    [hasBalanceChange, isUdcAction, showTxDetails],
  )

  const showFraudMonitorBanner = Boolean(warn && !isChangeGuardianTx)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen onReject={onRejectWithoutClose} />
  }

  const bannerProps: MultisigBannerProps = multisigBannerProps || {
    account: selectedAccount,
    confirmations: 0,
  }

  return (
    <ApproveTransactionScreen
      actionHash={actionHash}
      actionIsApproving={actionIsApproving}
      aggregatedData={aggregatedData}
      disableConfirm={disableConfirm}
      isMainnet={isMainnet}
      isSimulationLoading={isSimulationLoading}
      selectedAccount={selectedAccount}
      transactionReview={transactionReview}
      transactions={transactionsArray}
      transactionSimulation={transactionSimulation}
      verifiedDapp={verifiedDapp}
      hasPendingMultisigTransactions={hasPendingMultisigTransactions}
      multisig={multisig}
      multisigModalDisclosure={
        providedMultisigModalDisclosure || multisigModalDisclosure
      }
      onReject={onRejectAction}
      onSubmit={onSubmitAction}
      onConfirmAnyway={onConfirmAnyway}
      approveScreenType={approveScreenType}
      hasBalanceChange={hasBalanceChange}
      showFraudMonitorBanner={showFraudMonitorBanner}
      showTransactionActions={showTransactionActions}
      transactionActionsType={transactionActionsType}
      showTxDetails={showTxDetails}
      setShowTxDetails={setShowTxDetails}
      assessmentReason={reason}
      multisigBannerProps={bannerProps}
      confirmButtonText={
        hasInsufficientFunds && !userClickedAddFunds ? "Add funds" : "Confirm"
      }
      footer={
        <WithActionScreenErrorFooter isTransaction>
          {selectedAccount.needsDeploy ? (
            <CombinedFeeEstimationContainer
              onErrorChange={setDisableConfirm}
              onFeeErrorChange={onShowAddFunds}
              accountAddress={selectedAccount.address}
              networkId={selectedAccount.networkId}
              transactions={transactions}
              actionHash={actionHash}
              userClickedAddFunds={userClickedAddFunds}
              transactionSimulation={transactionSimulation}
              transactionSimulationFee={simulationEstimatedFee}
              transactionSimulationFeeError={transactionSimulationError}
              transactionSimulationLoading={isSimulationLoading}
            />
          ) : (
            <FeeEstimationContainer
              onErrorChange={setDisableConfirm}
              onFeeErrorChange={onShowAddFunds}
              accountAddress={selectedAccount.address}
              networkId={selectedAccount.networkId}
              transactions={transactions}
              actionHash={actionHash}
              userClickedAddFunds={userClickedAddFunds}
              transactionSimulation={transactionSimulation}
              transactionSimulationFee={simulationEstimatedFee}
              transactionSimulationFeeError={transactionSimulationError}
              transactionSimulationLoading={isSimulationLoading}
            />
          )}
        </WithActionScreenErrorFooter>
      }
      {...rest}
    />
  )
}
