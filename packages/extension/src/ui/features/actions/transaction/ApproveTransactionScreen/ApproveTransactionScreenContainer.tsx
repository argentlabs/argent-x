import { useAtom } from "jotai"
import { isEmpty, isFunction } from "lodash-es"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Call, TransactionType, isSierra, num } from "starknet"

import {
  Address,
  TokenWithBalance,
  TransactionAction,
  classHashSupportsTxV3,
  ensureArray,
} from "@argent/x-shared"
import { ETH_TOKEN_ADDRESS } from "../../../../../shared/network/constants"
import { BaseToken } from "../../../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../../../shared/token/__new/utils"
import { routes } from "../../../../../shared/ui/routes"
import { clientActionService } from "../../../../services/action"
import { feeTokenService } from "../../../../services/feeToken"
import { userClickedAddFundsAtom } from "../../../../views/actions"
import { useView } from "../../../../views/implementation/react"
import { useFeeTokenBalances } from "../../../accountTokens/useFeeTokenBalance"
import { useIsLedgerSigner } from "../../../ledger/hooks/useIsLedgerSigner"
import { RemovedMultisigWarningScreen } from "../../../multisig/RemovedMultisigWarningScreen"
import {
  isSignerInMultisigView,
  multisigView,
} from "../../../multisig/multisig.state"
import { useMultisigPendingTransactionsByAccount } from "../../../multisig/multisigTransactions.state"
import { useIsMainnet } from "../../../networks/hooks/useIsMainnet"
import { FeeTokenPickerModal } from "../../feeEstimation/ui/FeeTokenPickerModal"
import { useMaxFeeEstimation } from "../../feeEstimation/utils"
import { useActionScreen } from "../../hooks/useActionScreen"
import { FeeEstimationContainerV2 } from "../../transactionV2/FeeEstimationContainerV2"
import { useFeeTokenSelection } from "../../transactionV2/useFeeTokenSelection"
import { useTransactionReviewV2 } from "../../transactionV2/useTransactionReviewV2"
import { useDefaultFeeToken } from "../../useDefaultFeeToken"
import { ApproveScreenType, TransactionActionsType } from "../types"
import {
  useAggregatedSimData,
  useAggregatedTxFeesData,
} from "../useTransactionSimulatedData"
import { useTransactionSimulation } from "../useTransactionSimulation"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { WithActionScreenErrorFooter } from "./WithActionScreenErrorFooter"
import { ApproveTransactionScreenContainerProps } from "./approveTransactionScreen.model"

export const ApproveTransactionScreenContainer: FC<
  ApproveTransactionScreenContainerProps
> = ({
  actionHash,
  actionIsApproving,
  actionErrorApproving,
  selectedAccount,
  transactionAction,
  onReject,
  onSubmit,
  onConfirmAnyway,
  onRejectWithoutClose,
  approveScreenType,
  multisigBannerProps,
  ledgerActionModalDisclosure,
  ledgerErrorMessage,
  nonce,
  transactionContext = "STANDARD_EXECUTE",
  txNeedsRetry,
  showConfirmButton,
  ...rest
}) => {
  const { action } = useActionScreen()
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [showTxDetails, setShowTxDetails] = useState(false)
  const [userClickedAddFunds, setUserClickedAddFunds] = useAtom(
    userClickedAddFundsAtom,
  )
  const isMainnet = useIsMainnet()
  const multisig = useView(multisigView(selectedAccount))
  const signerIsInMultisig = useView(isSignerInMultisigView(selectedAccount))
  const navigate = useNavigate()

  // This is required because if STRK is selected as the user preferred fee token
  // It would throw an error as tx v1 doesn't support STRK
  const preferFeeToken = useMemo(() => {
    if (
      transactionAction.type === TransactionType.DECLARE &&
      !isSierra(transactionAction.payload.contract)
    ) {
      return [ETH_TOKEN_ADDRESS] as Address[]
    }
  }, [transactionAction.payload, transactionAction.type])

  const defaultFeeToken = useDefaultFeeToken(selectedAccount, {
    prefer: preferFeeToken,
  })
  const feeTokens = useFeeTokenBalances(selectedAccount)

  const [feeToken, setFeeToken] = useState<TokenWithBalance>(defaultFeeToken)
  const [isFeeTokenSelectionReady, setIsFeeTokenSelectionReady] =
    useState(false)

  const {
    data: transactionSimulation,
    isValidating: isSimulationValidating,
    error: transactionSimulationError,
  } = useTransactionSimulation({
    transactionAction,
    feeTokenAddress: feeToken?.address,
    actionHash,
  })
  const isSimulationLoading = isSimulationValidating && !transactionSimulation

  const { fee: feeSequencer, error: feeEstimationError } = useMaxFeeEstimation(
    actionHash,
    selectedAccount,
    transactionAction,
    feeToken?.address,
    transactionSimulation,
    isSimulationLoading,
  )

  const { fee } = useAggregatedTxFeesData(transactionSimulation, feeSequencer)

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

  const onSubmitAction = (transactionAction: TransactionAction) => {
    if (hasInsufficientFunds) {
      navigate(routes.funding(), { state: { showOnTop: true } })
      setUserClickedAddFunds(true)
      setHasInsufficientFunds(false)
      setDisableConfirm(true)
    } else {
      onSubmit(transactionAction)
    }
  }

  const onRejectAction = () => {
    setUserClickedAddFunds(false)
    if (isFunction(onReject)) {
      onReject()
    }
  }

  const transactionsArray: Call[] = useMemo(
    () =>
      transactionAction.type === "INVOKE_FUNCTION"
        ? ensureArray(transactionAction.payload)
        : [],
    [transactionAction.payload, transactionAction.type],
  )

  const { data: transactionReview } = useTransactionReviewV2({
    calls: transactionsArray,
    actionHash,
    feeTokenAddress: feeToken.address,
    selectedAccount,
    appDomain: action?.meta.origin,
  })

  const usesLedgerSigner = useIsLedgerSigner(selectedAccount)

  useEffect(() => {
    if (!actionHash || !transactionReview) {
      return
    }
    void clientActionService.updateTransactionReview({
      actionHash,
      transactionReview,
    })
  }, [actionHash, transactionReview])

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

  const transactionActionsType: TransactionActionsType | undefined =
    useMemo(() => {
      if (!selectedAccount) {
        return
      }

      return {
        type: "INVOKE_FUNCTION",
        payload: transactionsArray,
      }
    }, [selectedAccount, transactionsArray])

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

  // Disable fee token selection if the transaction is a Cairo0 declare transaction
  const declareSupportTokenSelection = useMemo(
    () =>
      transactionAction.type !== TransactionType.DECLARE ||
      isSierra(transactionAction.payload.contract),
    [transactionAction.payload, transactionAction.type],
  )

  // Disable fee token selection if the transaction is an upgrade transaction
  // or if its a multisig account
  const allowFeeTokenSelection =
    classHashSupportsTxV3(selectedAccount?.classHash) &&
    declareSupportTokenSelection

  const setPreferredFeeToken = useCallback(
    async (token: BaseToken) => {
      await feeTokenService.preferFeeToken(token.address)
      const newFeeToken = feeTokens.find((t) => equalToken(token, t))
      if (newFeeToken) {
        setFeeToken({
          ...newFeeToken,
          balance: num.toBigInt(newFeeToken.balance ?? 0),
        })
      }
      setIsFeeTokenPickerOpen(false)
    },
    [feeTokens],
  )

  const [isFeeTokenPickerOpen, setIsFeeTokenPickerOpen] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen onReject={onRejectWithoutClose} />
  }

  return (
    <>
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
        transactionAction={transactionAction}
        hasPendingMultisigTransactions={hasPendingMultisigTransactions}
        multisig={multisig}
        ledgerActionModalDisclosure={ledgerActionModalDisclosure}
        ledgerErrorMessage={ledgerErrorMessage}
        onReject={onRejectAction}
        onSubmit={onSubmitAction}
        onConfirmAnyway={onConfirmAnyway}
        approveScreenType={approveScreenType}
        hasBalanceChange={hasBalanceChange}
        showTransactionActions={showTransactionActions}
        transactionActionsType={transactionActionsType}
        showTxDetails={showTxDetails}
        setShowTxDetails={setShowTxDetails}
        multisigBannerProps={multisigBannerProps}
        nonce={nonce}
        isLedger={usesLedgerSigner}
        txNeedsRetry={txNeedsRetry}
        confirmButtonText={
          hasInsufficientFunds && !userClickedAddFunds ? "Add funds" : "Confirm"
        }
        showConfirmButton={showConfirmButton}
        footer={
          <WithActionScreenErrorFooter
            customError={actionErrorApproving}
            isTransaction
          >
            {showConfirmButton && (
              <FeeEstimationContainerV2
                fee={fee}
                feeToken={feeToken}
                onErrorChange={setDisableConfirm}
                onFeeErrorChange={onShowAddFunds}
                accountAddress={selectedAccount.address}
                networkId={selectedAccount.networkId}
                transactionSimulationFeeError={transactionSimulationError}
                transactionSimulationLoading={isSimulationLoading}
                allowFeeTokenSelection={allowFeeTokenSelection}
                onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
                needsDeploy={selectedAccount.needsDeploy}
                error={feeEstimationError}
                isSendingMoreThanBalanceAndGas={
                  transactionReview?.isSendingMoreThanBalanceAndGas
                }
              />
            )}
          </WithActionScreenErrorFooter>
        }
        {...rest}
      />
      <FeeTokenPickerModal
        isOpen={allowFeeTokenSelection && isFeeTokenPickerOpen}
        onClose={() => setIsFeeTokenPickerOpen(false)}
        tokens={feeTokens}
        onFeeTokenSelect={setPreferredFeeToken}
      />
    </>
  )
}
