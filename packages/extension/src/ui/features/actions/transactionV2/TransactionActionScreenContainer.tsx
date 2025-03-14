import type { Address } from "@argent/x-shared"
import {
  bigDecimal,
  classHashSupportsTxV3,
  ensureArray,
  filterPaymasterEstimatedFees,
  formatAddress,
  getMessageFromTrpcError,
  getPrettyRpcError,
  getUint256CalldataFromBN,
  isEqualAddress,
  nonNullable,
  prettifyTokenNumber,
  transferCalldataSchema,
} from "@argent/x-shared"
import { useDisclosure } from "@chakra-ui/react"
import { useAtom } from "jotai"
import { isEmpty, isObject } from "lodash-es"
import type { FC } from "react"
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import {
  getErrorMessageAndLabelFromSimulation,
  getHighestSeverity,
  isNotTransactionSimulationError,
  warningSchema,
} from "@argent/x-shared/simulation"
import { ActionScreenErrorFooter, Label, P3 } from "@argent/x-ui"
import {
  TransactionReviewActions,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import { num, TransactionType } from "starknet"
import { ampli } from "../../../../shared/analytics"
import { removeMultisigPendingTransactionOnRejectOnChain } from "../../../../shared/multisig/pendingTransactionsStore"
import { MultisigTransactionType } from "../../../../shared/multisig/types"
import type { BaseToken } from "../../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../../shared/token/__new/utils"
import { DAPP_TRANSACTION_TITLE } from "../../../../shared/transactions/utils"
import { routes } from "../../../../shared/ui/routes"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"
import { useRouteAccountDefi } from "../../../hooks/useRoute"
import { clientTokenService } from "../../../services/tokens"
import { userClickedAddFundsAtom } from "../../../views/actions"
import { useView } from "../../../views/implementation/react"
import { transactionHashFindAtom } from "../../../views/transactionHashes"
import { useTokenBalancesForFeeEstimates } from "../../accountTokens/useFeeTokenBalance"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { AccountDetailsNavigationBarContainer } from "../../navigation/AccountDetailsNavigationBarContainer"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { WithSmartAccountVerified } from "../../smartAccount/WithSmartAccountVerified"
import { FeeEstimationBoxSkeleton } from "../feeEstimation/ui/FeeEstimationBox"
import { FeeTokenPickerModal } from "../feeEstimation/ui/FeeTokenPickerModal"
import { WaitingForFunds } from "../feeEstimation/ui/WaitingForFunds"
import { useActionScreen } from "../hooks/useActionScreen"
import { useLedgerForTransaction } from "../hooks/useLedgerForTransaction"
import { useRejectDeployIfPresent } from "../hooks/useRejectDeployAction"
import type { ConfirmScreenProps } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConfirmScreen } from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { LedgerActionModal } from "../transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { AirGapReviewButtonContainer } from "../transaction/airgap/AirGapReviewButton"
import { getTransactionUsdValue } from "../transaction/getTransactionUsdValue"
import { ConfirmationModal } from "../warning/ConfirmationModal"
import { ReviewFooter } from "../warning/ReviewFooter"
import { WarningBanner } from "../warning/WarningBanner"
import { FeeEstimationContainer } from "./FeeEstimationContainer"
import { ReviewFallback } from "./ReviewFallback"
import {
  TransactionActionScreenSekeleton,
  TransactionReviewSkeleton,
} from "./TransactionActionScreenSkeleton"
import { TransactionHeader } from "./header"
import { useMultisigActionScreen } from "./useMultisigActionScreen"
import { useTransactionReviewV2 } from "./useTransactionReviewV2"
import { getRelatedTokensFromReview } from "./utils/getAmpliPayloadFromReview"
import { parseTransferTokenCall } from "./utils/parseTransferTokenCall"
import { useNativeFeeToken } from "../useNativeFeeToken"
import { useFeeTokenSelection } from "./useFeeTokenSelection"
import { addEstimatedFee } from "../../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { transactionReviewHasSwap } from "../../../../shared/transactionReview.service"
import { SwapTxReviewActions } from "../../swap/ui/SwapTxReviewActions"
import { useCheckGasFeeBalance } from "./useCheckGasBalance"
import { maxFeeEstimateForTransfer } from "../../accountTokens/useMaxFeeForTransfer"
import { useSimulationFeesWithSubsidiy } from "./useSimulationFeesWithSubsidiy"

interface TransactionActionScreenContainerProps extends ConfirmScreenProps {
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
}

/**
 * TransactionActionScreenContainerV2 component is responsible for handling the transaction action screen.
 * It manages the state and logic for approving, rejecting, and reviewing transactions.
 * It is only used for TRANSACTION (INVOKE) actions
 */
export const TransactionActionScreenContainer: FC<
  TransactionActionScreenContainerProps
> = ({ ...rest }) => {
  const {
    action,
    selectedAccount,
    approve,
    reject,
    rejectWithoutClose,
    closePopupIfLastAction,
    updateTransactionReview,
    clearLastActionError,
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

  const {
    disableLedgerApproval,
    isLedgerApprovalOpen,
    onLedgerApprovalClose,
    onLedgerApprovalOpen,
    isLedgerSigner,
    ledgerErrorMessage,
  } = useLedgerForTransaction(selectedAccount)

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
  const networkId = useCurrentNetwork().id

  const txHash = useView(transactionHashFindAtom(action.meta.hash))

  const [hasSentTransactionReviewedEvent, setHasSentTransactionReviewedEvent] =
    useState(false)

  const nativeFeeToken = useNativeFeeToken(selectedAccount)

  const transaction = useMemo(
    () => ({
      type: TransactionType.INVOKE,
      payload: action.payload.transactions,
    }),
    [action.payload.transactions],
  )

  const {
    data: transactionReview,
    error,
    isValidating: transactionReviewLoading,
  } = useTransactionReviewV2({
    transaction,
    actionHash: action.meta.hash,
    selectedAccount,
    appDomain: action.meta.origin,
  })

  const { simulationFees, isSubsidised } = useSimulationFeesWithSubsidiy(
    transactionReview,
    selectedAccount,
    ensureArray(action.payload.transactions),
  )

  const feeTokens = useTokenBalancesForFeeEstimates(
    selectedAccount,
    simulationFees,
  )

  const { feeToken, setFeeToken, isFeeTokenSelectionReady, fee } =
    useFeeTokenSelection({
      account: selectedAccount,
      fees: simulationFees,
      defaultFeeToken: nativeFeeToken,
      availableFeeTokens: feeTokens,
    })

  const isSendingMoreThanBalanceAndGas = useCheckGasFeeBalance({
    result: transactionReview,
    feeTokenWithBalance: feeToken,
  })

  const isInAppSecurityChange = useMemo(
    () => Boolean(action.payload.meta?.isInAppSecurityChange),
    [action],
  )

  const isRejectOnChain = useMemo(
    () =>
      action.payload.meta?.type ===
      MultisigTransactionType.MULTISIG_REJECT_ON_CHAIN,
    [action],
  )
  const reviewTrade = action.payload.meta?.reviewTrade
  const isSwap =
    transactionReview?.transactions?.some((t) =>
      transactionReviewHasSwap(t.reviewOfTransaction),
    ) && !!reviewTrade

  const shrinkContent = isSwap

  useEffect(() => {
    if (!transactionReviewLoading && !hasSentTransactionReviewedEvent) {
      const errorMessageAndLabel =
        getErrorMessageAndLabelFromSimulation(transactionReview)

      const hasSimulationError = Boolean(
        errorMessageAndLabel?.label || errorMessageAndLabel?.message,
      )
      const txUsdValue = getTransactionUsdValue(transactionReview)
      ampli.transactionReviewed({
        host: action.meta.origin,
        "simulation succeeded":
          Boolean(transactionReview) && !error && !hasSimulationError, // either the tx review request failed or the actual simulation failed
        "transaction type":
          action?.payload?.meta?.ampliProperties?.["transaction type"] ??
          "dapp",
        "staking provider":
          action?.payload?.meta?.ampliProperties?.["staking provider"],
        "wallet platform": "browser extension",
        "simulation error message": errorMessageAndLabel?.message,
        "simulation error label":
          errorMessageAndLabel?.label ?? "Tx not executed",
        "usd value": txUsdValue,
        ...(isSwap && {
          "base token": action?.payload?.meta?.ampliProperties?.["base token"],
          "quote token":
            action?.payload?.meta?.ampliProperties?.["quote token"],
          slippage: action?.payload?.meta?.ampliProperties?.["slippage"],
          "token pair": action?.payload?.meta?.ampliProperties?.["token pair"],
        }),
      })
      setHasSentTransactionReviewedEvent(true)
    }
  }, [
    action.meta.origin,
    action?.payload?.meta?.ampliProperties,
    error,
    hasSentTransactionReviewedEvent,
    transactionReviewLoading,
    transactionReview,
    isSwap,
    reviewTrade?.baseToken?.symbol,
    reviewTrade?.quoteToken?.symbol,
    reviewTrade?.slippage,
  ])

  const defiRoute = useRouteAccountDefi()
  const onSubmit = useCallback(async () => {
    const result = await approve()

    const txUsdValue = getTransactionUsdValue(transactionReview)
    if (
      action.meta.title === DAPP_TRANSACTION_TITLE &&
      transactionReview?.transactions
    ) {
      void ampli.transactionSubmitted({
        "account type": sanitizeAccountType(selectedAccount?.type),
        "account index": selectedAccount?.index,
        "wallet platform": "browser extension",
        "is deployment": Boolean(selectedAccount?.needsDeploy),
        host: action.meta.origin,
        "token addresses": getRelatedTokensFromReview(
          transactionReview.transactions,
        ),
        "transaction type": "dapp",
        "usd value": txUsdValue,
      })
    }

    if (action?.payload?.meta?.ampliProperties) {
      void ampli.transactionSubmitted({
        ...action.payload.meta.ampliProperties,
        "usd value": txUsdValue,
      })
    }

    // A reject on-chain tx needs to replace the one that was rejected
    if (isRejectOnChain) {
      void removeMultisigPendingTransactionOnRejectOnChain(
        action.payload.transactionsDetail?.nonce,
        selectedAccount,
      )
    }

    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      await rejectDeployIfPresent()

      if (location.pathname.includes(routes.swapToken())) {
        void navigate(routes.accountTokens())
      } else if (
        location.pathname.includes(routes.nativeUnstake("")) ||
        location.pathname.includes(routes.liquidUnstake(""))
      ) {
        void navigate(defiRoute)
      }

      closePopupIfLastAction()
    }
  }, [
    approve,
    transactionReview,
    action,
    isRejectOnChain,
    selectedAccount,
    rejectDeployIfPresent,
    closePopupIfLastAction,
    navigate,
    defiRoute,
  ])

  useEffect(() => {
    void updateTransactionReview(transactionReview)
  }, [transactionReview, updateTransactionReview])

  const transactionReviewSimulationError = useMemo(() => {
    if (isInAppSecurityChange) {
      return null
    }
    const errorMessageAndLabel =
      getErrorMessageAndLabelFromSimulation(transactionReview)
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
  }, [transactionReview, isInAppSecurityChange])

  const customErrorFooter = useMemo(() => {
    if (isInAppSecurityChange) {
      return null
    }
    if (!error) {
      return null
    }
    const message = getMessageFromTrpcError(error)
    if (!message) {
      return null
    }
    const rpcMessage = getPrettyRpcError(message)
    const title = rpcMessage ? (
      <Label prefix="Tx not executed: " label={rpcMessage} />
    ) : (
      "Tx not executed"
    )
    return <ActionScreenErrorFooter title={title} errorMessage={message} />
  }, [error, isInAppSecurityChange])

  const loadingOrErrorState = useMemo(() => {
    if (error) {
      console.warn("error", error)
      const defaultMessage =
        "Failed to load transaction details and fraud warnings. Transaction not executed."
      return (
        <ReviewFallback
          calls={ensureArray(action.payload.transactions)}
          message={defaultMessage}
        />
      )
    }
    if (transactionReviewSimulationError) {
      return null
    }
    if (!transactionReview || !isFeeTokenSelectionReady) {
      return <TransactionReviewSkeleton px={0} />
    }
    return null
  }, [
    action.payload.transactions,
    error,
    isFeeTokenSelectionReady,
    transactionReview,
    transactionReviewSimulationError,
  ])

  const rejectOnChainBanner = useMemo(() => {
    if (!isRejectOnChain) {
      return null
    }
    return (
      <P3
        background={"black"}
        border={"1px solid"}
        borderColor={"neutrals.600"}
        borderRadius={"xl"}
        color={"neutrals.300"}
        p={3}
      >
        On-chain rejections don’t send any funds. Executing this on-chain
        rejection will allow the next queued transaction to move to the front of
        the queue
      </P3>
    )
  }, [isRejectOnChain])

  const rejectOnChainNonce = useMemo(
    () =>
      isRejectOnChain ? action.payload.transactionsDetail?.nonce : undefined,
    [isRejectOnChain, action.payload.transactionsDetail?.nonce],
  )

  const transactionReviewSimulation = useMemo(() => {
    if (!transactionReview) {
      return null
    }

    if (isRejectOnChain) {
      return null
    }

    const txSimulations = transactionReview.transactions?.flatMap(
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
    const hasCriticalWarning = transactionReview.transactions?.some(
      (transaction) =>
        transaction.reviewOfTransaction?.warnings?.some(
          (warning) => warning.severity === "critical",
        ),
    )

    if (hasCriticalWarning && hasNoBalanceChange) {
      return null
    }

    if (
      !hasCriticalWarning &&
      action.meta.investment?.stakingAction === "initiateWithdraw"
    ) {
      return null
    }

    return (
      <TransactionReviewSimulation
        simulation={lastSimulation}
        networkId={networkId}
        {...(shrinkContent && { gap: 1 })}
      />
    )
  }, [
    transactionReview,
    isRejectOnChain,
    action.meta.investment?.stakingAction,
    networkId,
    shrinkContent,
  ])

  const transactionReviewActions = useMemo(() => {
    if (isRejectOnChain) {
      return (
        <P3
          background={"neutrals.800"}
          borderRadius={"md"}
          fontWeight={"semibold"}
          display={"flex"}
          justifyContent={"space-between"}
          p={3}
        >
          On-chain rejection
        </P3>
      )
    }

    if (isSwap) {
      return <SwapTxReviewActions reviewTrade={reviewTrade} />
    }

    const actions = transactionReview?.transactions?.map(
      (transaction, index) => {
        return (
          <TransactionReviewActions
            key={`review-${index}`}
            reviewOfTransaction={transaction.reviewOfTransaction}
            initiallyExpanded={false}
            networkId={networkId}
          />
        )
      },
    )
    return actions
  }, [
    isRejectOnChain,
    isSwap,
    networkId,
    reviewTrade,
    transactionReview?.transactions,
  ])

  const warnings = transactionReview?.transactions?.flatMap((transaction) => {
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

  useEffect(() => {
    if (
      !isInAppSecurityChange &&
      highestSeverityWarning &&
      (highestSeverityWarning.severity === "critical" ||
        highestSeverityWarning.severity === "high")
    ) {
      setAskForConfirmation(true)
      setIsHighRisk(true)
    }
  }, [highestSeverityWarning, isInAppSecurityChange])

  const transactionReviewWarnings = useMemo(() => {
    if (isInAppSecurityChange) {
      return null
    }
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
  }, [warningsWithoutUndefined, reject, isInAppSecurityChange])

  const transactionReviewFallback = useMemo(
    () =>
      transactionReview?.isBackendDown && (
        <ReviewFallback calls={ensureArray(action.payload.transactions)} />
      ),
    [transactionReview, action.payload.transactions],
  )

  const navigationBar = <AccountDetailsNavigationBarContainer />

  const actionIsApproving = Boolean(action.meta.startedApproving)

  const onSubmitWithLedger = async () => {
    await clearLastActionError()
    onLedgerApprovalOpen()

    void onSubmit()
  }

  const { multisig, multisigBanner, signerIsInMultisig } =
    useMultisigActionScreen()

  // Disable fee token selection if the account doesn't support tx v3
  const allowFeeTokenSelection =
    classHashSupportsTxV3(selectedAccount?.classHash) && !isSubsidised

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

  const updateFeeToken = useCallback(
    async (token: BaseToken) => {
      if (isEqualAddress(token.address, feeToken?.address)) {
        return setIsFeeTokenPickerOpen(false)
      }

      const newFeeToken = feeTokens.find((t) => equalToken(token, t))
      if (newFeeToken) {
        setFeeToken({
          ...newFeeToken,
          balance: num.toBigInt(newFeeToken.balance ?? 0),
        })

        const transferTokenCall =
          action.payload.meta?.isMaxSend &&
          parseTransferTokenCall(action.payload.transactions)
        const transferToken =
          transferTokenCall &&
          feeTokens?.find((feeToken) =>
            isEqualAddress(feeToken.address, transferTokenCall.tokenAddress),
          )

        setIsFeeTokenPickerOpen(false)

        if (transferTokenCall && transferToken && selectedAccount) {
          // If the user has selected a different fee token, we need to recompute the max amount
          console.warn(
            "Max send detected, recreating transaction with new max amount",
          )
          const { recipient, tokenAddress } = transferTokenCall
          const balance =
            (await clientTokenService.getTokenBalance(
              transferToken.address,
              selectedAccount.address as Address,
              networkId,
            )) ?? "0"

          const deductMaxFeeFromMaxAmount = isEqualAddress(
            tokenAddress,
            token.address,
          )

          const feeWithToken = simulationFees?.find((fee) =>
            isEqualAddress(fee.transactions.feeTokenAddress, tokenAddress),
          )
          if (!feeWithToken) {
            throw new Error("Fee with token not found")
          }

          const maxFeeForTransfer = await maxFeeEstimateForTransfer(
            token.address,
            tokenAddress,
            selectedAccount,
          )

          const maxAmount = deductMaxFeeFromMaxAmount
            ? BigInt(balance) - (maxFeeForTransfer ?? 0n)
            : BigInt(balance)

          if (!nonNullable(maxAmount)) {
            throw new Error("maxAmount could not be determined")
          }
          const formattedMaxAmount = bigDecimal.formatUnits({
            value: maxAmount,
            decimals: transferToken.decimals,
          })

          await clientTokenService.send({
            to: tokenAddress,
            method: "transfer",
            calldata: transferCalldataSchema.parse({
              recipient,
              amount: getUint256CalldataFromBN(maxAmount),
            }),
            title: `Send ${prettifyTokenNumber(formattedMaxAmount)} ${
              transferToken.symbol
            }`,
            shortTitle: `Send`,
            subtitle: `To: ${formatAddress(recipient)}`,
            isMaxSend: true,
          })
          void reject()
        }
      }
    },
    [
      action.payload.meta?.isMaxSend,
      action.payload.transactions,
      feeToken?.address,
      feeTokens,
      networkId,
      reject,
      selectedAccount,
      setFeeToken,
      simulationFees,
    ],
  )

  const onConfirm = () => {
    onConfirmationModalClose()
    void onSubmit()
  }

  const updateFees = useCallback(async () => {
    if (!fee) return

    if (isSubsidised) {
      const paymasterFee = filterPaymasterEstimatedFees(simulationFees)[0]
      if (paymasterFee) {
        await addEstimatedFee(
          { ...paymasterFee, type: "paymaster" },
          transaction,
          isSubsidised,
        )
      }

      return
    }
    await addEstimatedFee(fee, transaction) // Should this be a service?
  }, [fee, isSubsidised, simulationFees, transaction])

  const onSubmitWithChecks = async () => {
    await updateFees()
    if (hasInsufficientFunds) {
      void navigate(routes.funding(), { state: { showOnTop: true } })
      setUserClickedAddFunds(true)
      setHasInsufficientFunds(false)
      setDisableConfirm(true)
      return
    }

    if (askForConfirmation) {
      onConfirmationModalOpen()
      return
    }

    if (isLedgerSigner) {
      return onSubmitWithLedger()
    }

    await onSubmit()
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
    <Suspense fallback={<FeeEstimationBoxSkeleton />}>
      <WithActionScreenErrorFooter isTransaction>
        {isHighRisk && <ReviewFooter />}
        {selectedAccount && simulationFees && isFeeTokenSelectionReady ? (
          <FeeEstimationContainer
            onErrorChange={setDisableConfirm}
            onFeeErrorChange={onShowAddFunds}
            fee={fee}
            feeToken={feeToken}
            accountId={selectedAccount.id}
            needsDeploy={selectedAccount.needsDeploy}
            onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
            allowFeeTokenSelection={allowFeeTokenSelection}
            transactionSimulationLoading={transactionReviewLoading}
            error={error}
            isSendingMoreThanBalanceAndGas={isSendingMoreThanBalanceAndGas}
            isSubsidised={isSubsidised}
          />
        ) : (
          !transactionReviewSimulationError && <FeeEstimationBoxSkeleton />
        )}
        {transactionReviewSimulationError}
      </WithActionScreenErrorFooter>
    </Suspense>
  )

  if (multisig && !signerIsInMultisig) {
    return (
      <RemovedMultisigWarningScreen
        onReject={() => void rejectWithoutClose()}
      />
    )
  }

  const confirmButtonText =
    hasInsufficientFunds && !userClickedAddFunds
      ? "Add funds"
      : isRejectOnChain
        ? "Confirm rejection"
        : "Confirm"

  const rejectButtonText = isRejectOnChain ? "Cancel" : "Reject"

  const confirmButtonDisabled =
    disableConfirm || (isHighRisk && !hasAcceptedRisk) || disableLedgerApproval

  return (
    <WithSmartAccountVerified
      transactions={action.payload.transactions}
      fallback={<TransactionActionScreenSekeleton action={action} />}
    >
      <ConfirmScreen
        navigationBar={navigationBar}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonDisabled={confirmButtonDisabled}
        confirmButtonText={confirmButtonText}
        rejectButtonText={rejectButtonText}
        onSubmit={() => void onSubmitWithChecks()}
        showHeader={true}
        onReject={onReject}
        footer={footer}
        destructive={askForConfirmation || isHighRisk}
        isLedger={isLedgerSigner}
        {...rest}
      >
        <TransactionHeader
          px={0}
          title={action.meta?.title}
          dappLogoUrl={
            transactionReview?.transactions?.[0]?.reviewOfTransaction
              ?.targetedDapp?.logoUrl
          }
          subtitle={action.meta?.subtitle ?? action.meta.origin}
          dappHost={action.meta.origin}
          iconKey={action.meta?.icon}
          transactionType={TransactionType.INVOKE}
          hideIcon={shrinkContent}
        />
        <Suspense fallback={<TransactionReviewSkeleton px={0} />}>
          {rejectOnChainBanner}
          {multisigBanner}
          {isFeeTokenSelectionReady && (
            <>
              {transactionReviewFallback}
              {transactionReviewWarnings}
              {transactionReviewSimulation}
              {transactionReviewActions}
              <AirGapReviewButtonContainer
                selectedAccount={selectedAccount}
                transactions={action.payload.transactions}
                estimatedFees={fee}
                nonce={rejectOnChainNonce}
              />
            </>
          )}
          {loadingOrErrorState}
        </Suspense>
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
        onFeeTokenSelect={(token) => void updateFeeToken(token)}
        estimatedFees={simulationFees}
        feeToken={nativeFeeToken}
      />
      {isLedgerSigner && simulationFees && (
        <LedgerActionModal
          isOpen={isLedgerApprovalOpen}
          onClose={onLedgerApprovalClose}
          onSubmit={onSubmit}
          errorMessage={ledgerErrorMessage}
          txHash={txHash}
        />
      )}
    </WithSmartAccountVerified>
  )
}
