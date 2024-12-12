import { useAtom } from "jotai"
import { isFunction } from "lodash-es"
import type { FC } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import type { Call } from "starknet"
import { TransactionType, isSierra, num } from "starknet"

import type {
  Address,
  TokenWithBalance,
  TransactionAction,
} from "@argent/x-shared"
import { classHashSupportsTxV3, ensureArray } from "@argent/x-shared"
import { ETH_TOKEN_ADDRESS } from "../../../../../shared/network/constants"
import type { BaseToken } from "../../../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../../../shared/token/__new/utils"
import { routes } from "../../../../../shared/ui/routes"
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
import { useActionScreen } from "../../hooks/useActionScreen"
import { FeeEstimationContainer } from "../../transactionV2/FeeEstimationContainer"
import { useFeeTokenSelection } from "../../transactionV2/useFeeTokenSelection"
import { useTransactionReviewV2 } from "../../transactionV2/useTransactionReviewV2"
import { useDefaultFeeToken } from "../../useDefaultFeeToken"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { WithActionScreenErrorFooter } from "./WithActionScreenErrorFooter"
import type { ApproveTransactionScreenContainerProps } from "./approveTransactionScreen.model"

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
  disableLedgerApproval: _disableLedgerApproval,
  ...rest
}) => {
  const { action, updateTransactionReview } = useActionScreen()
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

  const transactionsArray: Call[] = useMemo(
    () =>
      transactionAction.type === "INVOKE_FUNCTION"
        ? ensureArray(transactionAction.payload)
        : [],
    [transactionAction.payload, transactionAction.type],
  )

  const {
    data: transactionReview,
    error,
    isValidating,
  } = useTransactionReviewV2({
    transaction: transactionAction,
    actionHash,
    feeTokenAddress: feeToken.address,
    selectedAccount,
    appDomain: action?.meta.origin,
  })

  const isSimulationLoading = !transactionReview && isValidating

  useFeeTokenSelection({
    isFeeTokenSelectionReady,
    setIsFeeTokenSelectionReady,
    feeToken,
    setFeeToken,
    account: selectedAccount,
    fee: transactionReview?.enrichedFeeEstimation,
    defaultFeeToken,
    feeTokens,
  })

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

  const usesLedgerSigner = useIsLedgerSigner(selectedAccount.id)

  useEffect(() => {
    void updateTransactionReview(transactionReview)
  }, [transactionReview, updateTransactionReview])

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
        disableConfirm={disableConfirm}
        isMainnet={isMainnet}
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
              <FeeEstimationContainer
                fee={transactionReview?.enrichedFeeEstimation}
                feeToken={feeToken}
                onErrorChange={setDisableConfirm}
                onFeeErrorChange={onShowAddFunds}
                accountId={selectedAccount.id}
                transactionSimulationLoading={isSimulationLoading}
                allowFeeTokenSelection={allowFeeTokenSelection}
                onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
                needsDeploy={selectedAccount.needsDeploy}
                error={error}
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
        onFeeTokenSelect={(token) => void setPreferredFeeToken(token)}
      />
    </>
  )
}
