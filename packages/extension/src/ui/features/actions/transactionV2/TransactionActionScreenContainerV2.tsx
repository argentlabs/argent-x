import {
  Address,
  ensureArray,
  formatAddress,
  getUint256CalldataFromBN,
  isEqualAddress,
  nonNullable,
  prettifyTokenNumber,
  transferCalldataSchema,
} from "@argent/x-shared"
import { Divider, useDisclosure } from "@chakra-ui/react"
import { formatUnits } from "ethers"
import { useAtom } from "jotai"
import { isEmpty, isObject } from "lodash-es"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { isTransactionActionItem } from "../../../../shared/actionQueue/types"
import { getMessageFromTrpcError } from "../../../../shared/errors/schema"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import {
  getMessageFromSimulationError,
  isNotTransactionSimulationError,
  isTransactionSimulationError,
  warningSchema,
} from "../../../../shared/transactionReview/schema"
import { isSafeUpgradeTransaction } from "../../../../shared/utils/isUpgradeTransaction"
import { ListSkeleton } from "../../../components/ScreenSkeleton"
import { routes } from "../../../routes"
import { feeTokenService } from "../../../services/feeToken"
import { tokenService } from "../../../services/tokens"
import { userClickedAddFundsAtom } from "../../../views/actions"
import { useNetworkFeeTokens } from "../../accountTokens/tokens.state"
import { useFeeTokenBalances } from "../../accountTokens/useFeeTokenBalance"
import { maxFeeEstimateForTransfer } from "../../accountTokens/useMaxFeeForTransfer"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { WithArgentShieldVerified } from "../../shield/WithArgentShieldVerified"
import { FeeTokenPickerModal } from "../feeEstimation/ui/FeeTokenPickerModal"
import { WaitingForFunds } from "../feeEstimation/ui/WaitingForFunds"
import { useActionScreen } from "../hooks/useActionScreen"
import { useRejectDeployIfPresent } from "../hooks/useRejectDeployAction"
import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { useBestFeeToken } from "../useBestFeeToken"
import { ConfirmationModal } from "../warning/ConfirmationModal"
import { ReviewFooter } from "../warning/ReviewFooter"
import { WarningBanner } from "../warning/WarningBanner"
import { getHighestSeverity } from "../warning/helper"
import { FeeEstimationContainerV2 } from "./FeeEstimationContainerV2"
import { ReviewFallback } from "./ReviewFallback"
import { TransactionHeader } from "./TransactionHeader"
import { AccountDetails } from "./TransactionHeader/AccountDetails"
import { TransactionReviewLabel } from "./TransactionReviewLabel"
import { TransactionReviewActions } from "./action/TransactionReviewActions"
import { TransactionReviewSimulation } from "./simulation/TransactionReviewSimulation"
import { useMultisigActionScreen } from "./useMultisigActionScreen"
import { useTransactionReviewV2 } from "./useTransactionReviewV2"
import { parseTransferTokenCall } from "./utils/parseTransferTokenCall"
import { getPrettyRpcError } from "./utils/getPrettyRpcError"
import { ActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/ActionScreenErrorFooter"

export interface TransactionActionScreenContainerV2Props
  extends ConfirmScreenProps {
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
}

export const TransactionActionScreenContainerV2: FC<
  TransactionActionScreenContainerV2Props
> = ({ transactionContext = "STANDARD_EXECUTE", ...rest }) => {
  const {
    action,
    selectedAccount,
    approve,
    reject,
    rejectWithoutClose,
    closePopupIfLastAction,
  } = useActionScreen()
  if (action?.type !== "TRANSACTION") {
    throw new Error(
      "TransactionActionScreenContainer used with incompatible action.type",
    )
  }
  const {
    isOpen: isConfirmationModalOpen,
    onOpen: onConfirmationModalOpen,
    onClose: onConfirmationModalClose,
  } = useDisclosure()

  const navigate = useNavigate()
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [userClickedAddFunds, setUserClickedAddFunds] = useAtom(
    userClickedAddFundsAtom,
  )
  const [askForConfirmation, setAskForConfirmation] = useState(false)
  const [isHighRisk, setIsHighRisk] = useState(false)
  const [hasAcceptedRisk, setHasAcceptedRisk] = useState(false)
  const [isFeeTokenPickerOpen, setIsFeeTokenPickerOpen] = useState(false)
  const rejectDeployIfPresent = useRejectDeployIfPresent()
  const feeTokePickerRef = useRef<HTMLDivElement>(null)

  const feeTokens = useFeeTokenBalances(selectedAccount)

  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      await rejectDeployIfPresent()
      closePopupIfLastAction()
      if (location.pathname === routes.swap()) {
        navigate(routes.accountActivity())
      }
    }
  }, [approve, rejectDeployIfPresent, closePopupIfLastAction, navigate])

  const feeToken = useBestFeeToken(selectedAccount)

  const {
    data: transactionReview,
    error,
    isValidating,
  } = useTransactionReviewV2({
    calls: action.payload.transactions,
    actionHash: action.meta.hash,
    feeTokenAddress: feeToken?.address,
    selectedAccount,
  })

  const loadingOrErrorState = useMemo(() => {
    if (error) {
      console.warn("error", error)
      return (
        <ReviewFallback
          calls={ensureArray(action.payload.transactions)}
          message={
            "Failed to load transaction details and fraud warnings. Transaction not executed."
          }
        />
      )
    }
    if (!transactionReview) {
      return <ListSkeleton px={0} />
    }
    return null
  }, [action.payload.transactions, error, transactionReview])

  const customErrorFooter = useMemo(() => {
    if (!error) {
      return null
    }
    const message = getMessageFromTrpcError(error)
    if (!message) {
      return null
    }
    const rpcMessage = getPrettyRpcError(message)
    const title = rpcMessage ? (
      <TransactionReviewLabel prefix="Tx not executed: " label={rpcMessage} />
    ) : (
      "Tx not executed"
    )
    return <ActionScreenErrorFooter title={title} errorMessage={message} />
  }, [error])

  /** TODO: come back and refactor all this properly */

  const transactionReviewSimulationError = useMemo(() => {
    if (!transactionReview) {
      return null
    }
    const txSimulationErrors = transactionReview.transactions.flatMap(
      (transaction) =>
        isTransactionSimulationError(transaction)
          ? transaction.simulationError
          : false,
    )
    // We only keep the last one as if there's more than one the first one is for the deployment of the account
    const lastSimulationError =
      txSimulationErrors?.[txSimulationErrors.length - 1]
    if (!lastSimulationError) {
      return null
    }

    const errorMessage = getMessageFromSimulationError(lastSimulationError)

    const lastSimulationErrorOrMessage =
      lastSimulationError.message || lastSimulationError.error

    const rpcError = getPrettyRpcError(lastSimulationErrorOrMessage)

    const label = rpcError ? rpcError : lastSimulationError.label
    const message = rpcError ? lastSimulationErrorOrMessage : errorMessage

    return (
      <ActionScreenErrorFooter
        title={
          <TransactionReviewLabel prefix="Tx not executed:" label={label} />
        }
        errorMessage={message}
      />
    )
  }, [transactionReview])

  const transactionReviewSimulation = useMemo(() => {
    if (!transactionReview) {
      return null
    }
    const txSimulations = transactionReview.transactions.flatMap(
      (transaction) =>
        isNotTransactionSimulationError(transaction)
          ? transaction.simulation
          : false,
    )
    // We only keep the last one as if there's more than one the first one is for the deployment of the account
    const lastSimulation = txSimulations?.[txSimulations.length - 1]
    if (!lastSimulation) {
      return null
    }

    // don't show 'no balance change' when there is a critical warning as the two messages conflict from a user perspective
    const hasNoBalanceChange = isEmpty(lastSimulation.summary)
    const hasCriticalWarning = transactionReview.transactions.some(
      (transaction) =>
        transaction.reviewOfTransaction?.warnings?.some(
          (warning) => warning.severity === "critical",
        ),
    )

    if (hasCriticalWarning && hasNoBalanceChange) {
      return null
    }

    return <TransactionReviewSimulation simulation={lastSimulation} />
  }, [transactionReview])

  const transactionReviewActions = useMemo(() => {
    return transactionReview?.transactions.map((transaction, index) => {
      return (
        <TransactionReviewActions
          key={`review-${index}`}
          reviewOfTransaction={transaction.reviewOfTransaction}
          initiallyExpanded={false}
        />
      )
    })
  }, [transactionReview])

  const warnings = transactionReview?.transactions.flatMap((transaction) => {
    return transaction.reviewOfTransaction?.warnings
  })

  const warningsWithoutUndefined = z
    .array(warningSchema)
    .safeParse(
      warnings?.filter((warning) => !isEmpty(warning) && warning !== undefined),
    )

  const highestSeverityWarning =
    warningsWithoutUndefined.success &&
    getHighestSeverity(warningsWithoutUndefined.data)

  const isUpgradeTransaction = useMemo(
    () =>
      isTransactionActionItem(action) &&
      isSafeUpgradeTransaction(action.payload),
    [action],
  )

  useEffect(() => {
    if (
      highestSeverityWarning &&
      (highestSeverityWarning.severity === "critical" ||
        highestSeverityWarning.severity === "high")
    ) {
      setAskForConfirmation(true)
      setIsHighRisk(true)
    }
  }, [highestSeverityWarning])

  const transactionReviewWarnings = useMemo(() => {
    if (!warningsWithoutUndefined.success) {
      return null
    }
    return (
      <WarningBanner
        warnings={warningsWithoutUndefined.data}
        onReject={() => void reject()}
        onConfirm={() => setHasAcceptedRisk(true)}
      />
    )
  }, [warningsWithoutUndefined, reject])

  const transactionReviewFallback = useMemo(
    () =>
      transactionReview?.isBackendDown && (
        <ReviewFallback calls={ensureArray(action.payload.transactions)} />
      ),
    [transactionReview, action.payload.transactions],
  )

  const navigationBar = (
    <>
      <AccountDetails />
      <Divider color="neutrals.700" />
    </>
  )
  const actionIsApproving = Boolean(action.meta.startedApproving)

  const {
    multisig,
    multisigModal,
    multisigBanner,
    signerIsInMultisig,
    hasPendingMultisigTransactions,
    multisigModalDisclosure,
  } = useMultisigActionScreen({ onSubmit, transactionContext })

  const networkFeeTokens = useNetworkFeeTokens(selectedAccount?.networkId)
  // Disable fee token selection if the transaction is an upgrade transaction
  // or if its a multisig account
  const allowFeeTokenSelection = !isUpgradeTransaction && !multisig

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

  const setPreferredFeeToken = useCallback(
    async ({ address }: BaseToken) => {
      await feeTokenService.preferFeeToken(address)

      const transferTokenCall =
        action.payload.meta?.isMaxSend &&
        parseTransferTokenCall(action.payload.transactions)
      const transferToken =
        transferTokenCall &&
        networkFeeTokens?.find((networkFeeToken) =>
          isEqualAddress(
            networkFeeToken.address,
            transferTokenCall.tokenAddress,
          ),
        )
      setIsFeeTokenPickerOpen(false)

      if (transferTokenCall && transferToken && selectedAccount) {
        // If the user has selected a different fee token, we need to recompute the max amount
        console.warn(
          "Max send detected, recreating transaction with new max amount",
        )
        const { recipient, tokenAddress } = transferTokenCall
        const maxFeeForTransfer = await maxFeeEstimateForTransfer(
          address,
          tokenAddress,
          selectedAccount,
        )
        const balance = await tokenService.fetchTokenBalance(
          transferToken.address,
          selectedAccount.address as Address,
          selectedAccount.networkId,
        )
        const maxAmount = BigInt(balance) - (maxFeeForTransfer ?? 0n)
        if (!nonNullable(maxAmount)) {
          throw new Error("maxAmount could not be determined")
        }
        const formattedMaxAmount = formatUnits(
          maxAmount,
          transferToken.decimals,
        )

        await tokenService.send({
          to: tokenAddress,
          method: "transfer",
          calldata: transferCalldataSchema.parse({
            recipient,
            amount: getUint256CalldataFromBN(maxAmount),
          }),
          title: `Send ${prettifyTokenNumber(formattedMaxAmount)} ${
            transferToken.symbol
          }`,
          subtitle: `to ${formatAddress(recipient)}`,
          isMaxSend: true,
        })
        void reject()
      }
    },
    [
      action.payload.meta?.isMaxSend,
      action.payload.transactions,
      networkFeeTokens,
      reject,
      selectedAccount,
    ],
  )

  const onConfirm = () => {
    onConfirmationModalClose()
    void onSubmit()
  }

  const onSubmitWithChecks = () => {
    if (hasInsufficientFunds) {
      navigate(routes.funding(), { state: { showOnTop: true } })
      setUserClickedAddFunds(true)
      setHasInsufficientFunds(false)
      setDisableConfirm(true)
      return
    }
    if (hasPendingMultisigTransactions) {
      multisigModalDisclosure.onOpen()
      return
    }
    if (askForConfirmation) {
      onConfirmationModalOpen()
      return
    }
    void onSubmit()
  }
  const onReject = useCallback(() => {
    setUserClickedAddFunds(false)
    void reject()
  }, [reject, setUserClickedAddFunds])

  const footer = userClickedAddFunds ? (
    <WaitingForFunds />
  ) : customErrorFooter ? (
    customErrorFooter
  ) : (
    <WithActionScreenErrorFooter isTransaction>
      {isHighRisk && <ReviewFooter />}
      {selectedAccount && transactionReview?.enrichedFeeEstimation && (
        <FeeEstimationContainerV2
          onErrorChange={setDisableConfirm}
          onFeeErrorChange={onShowAddFunds}
          transactionSimulationLoading={isValidating}
          fee={transactionReview.enrichedFeeEstimation}
          feeToken={feeToken}
          networkId={selectedAccount.networkId}
          accountAddress={selectedAccount.address}
          needsDeploy={selectedAccount.needsDeploy}
          onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
          allowFeeTokenSelection={allowFeeTokenSelection}
          error={error}
        />
      )}
      {transactionReviewSimulationError}
    </WithActionScreenErrorFooter>
  )

  if (multisig && !signerIsInMultisig) {
    return (
      <RemovedMultisigWarningScreen
        onReject={() => void rejectWithoutClose()}
      />
    )
  }

  const confirmButtonText =
    hasInsufficientFunds && !userClickedAddFunds ? "Add funds" : "Confirm"

  return (
    <WithArgentShieldVerified transactions={action.payload.transactions}>
      <ConfirmScreen
        navigationBar={navigationBar}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonDisabled={
          disableConfirm || (isHighRisk && !hasAcceptedRisk)
        }
        confirmButtonText={confirmButtonText}
        onSubmit={onSubmitWithChecks}
        showHeader={true}
        onReject={onReject}
        footer={footer}
        destructive={askForConfirmation || isHighRisk}
        {...rest}
      >
        {multisigModal}
        <TransactionHeader
          px={0}
          title={action.meta?.title}
          dappLogoUrl={
            transactionReview?.transactions[0]?.reviewOfTransaction
              ?.targetedDapp?.logoUrl
          }
          subtitle={action.meta?.subtitle ?? action.meta.origin}
          dappHost={action.meta.origin}
          iconKey={action.meta?.icon}
        />
        {multisigBanner}
        {transactionReviewFallback}
        {transactionReviewWarnings}
        {transactionReviewSimulation}
        {transactionReviewActions}
        {loadingOrErrorState}
      </ConfirmScreen>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={onConfirmationModalClose}
        onConfirm={onConfirm}
      />
      <FeeTokenPickerModal
        isOpen={allowFeeTokenSelection && isFeeTokenPickerOpen}
        onClose={() => {
          setIsFeeTokenPickerOpen(false)
        }}
        tokens={feeTokens}
        initialFocusRef={feeTokePickerRef}
        onFeeTokenSelect={setPreferredFeeToken}
      />
    </WithArgentShieldVerified>
  )
}
