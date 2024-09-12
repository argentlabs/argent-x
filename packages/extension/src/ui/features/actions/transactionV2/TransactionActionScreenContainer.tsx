import {
  Address,
  classHashSupportsTxV3,
  ensureArray,
  formatAddress,
  getMessageFromTrpcError,
  getUint256CalldataFromBN,
  isEqualAddress,
  nonNullable,
  prettifyTokenNumber,
  TokenWithBalance,
  transferCalldataSchema,
  getPrettyRpcError,
} from "@argent/x-shared"
import { Divider, useDisclosure } from "@chakra-ui/react"
import { formatUnits } from "ethers"
import { useAtom } from "jotai"
import { isEmpty, isObject } from "lodash-es"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import {
  getErrorMessageAndLabelFromSimulation,
  isNotTransactionSimulationError,
  warningSchema,
  getHighestSeverity,
} from "@argent/x-shared/simulation"
import { ActionScreenErrorFooter, Label, P4 } from "@argent/x-ui"
import {
  TransactionReviewActions,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import { num } from "starknet"
import { isTransactionActionItem } from "../../../../shared/actionQueue/types"
import { ampli } from "../../../../shared/analytics"
import { removeMultisigPendingTransactionOnRejectOnChain } from "../../../../shared/multisig/pendingTransactionsStore"
import { MultisigTransactionType } from "../../../../shared/multisig/types"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import { equalToken } from "../../../../shared/token/__new/utils"
import { DAPP_TRANSACTION_TITLE } from "../../../../shared/transactions/utils"
import { routes } from "../../../../shared/ui/routes"
import { isSafeUpgradeTransaction } from "../../../../shared/utils/isSafeUpgradeTransaction"
import { ListSkeleton } from "../../../components/ScreenSkeleton"
import { feeTokenService } from "../../../services/feeToken"
import { clientTokenService } from "../../../services/tokens"
import { userClickedAddFundsAtom } from "../../../views/actions"
import { useFeeTokenBalances } from "../../accountTokens/useFeeTokenBalance"
import { maxFeeEstimateForTransfer } from "../../accountTokens/useMaxFeeForTransfer"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { WithSmartAccountVerified } from "../../smartAccount/WithSmartAccountVerified"
import { FeeTokenPickerModal } from "../feeEstimation/ui/FeeTokenPickerModal"
import { WaitingForFunds } from "../feeEstimation/ui/WaitingForFunds"
import { useActionScreen } from "../hooks/useActionScreen"
import { useLedgerForTransaction } from "../hooks/useLedgerForTransaction"
import { useRejectDeployIfPresent } from "../hooks/useRejectDeployAction"
import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { LedgerActionModal } from "../transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { useDefaultFeeToken } from "../useDefaultFeeToken"
import { ConfirmationModal } from "../warning/ConfirmationModal"
import { ReviewFooter } from "../warning/ReviewFooter"
import { WarningBanner } from "../warning/WarningBanner"
import { FeeEstimationContainerV2 } from "./FeeEstimationContainerV2"
import { ReviewFallback } from "./ReviewFallback"
import { TransactionHeader } from "./header"
import { NavigationBarAccountDetailsContainer } from "./header/NavigationBarAccountDetailsContainer"
import { useFeeTokenSelection } from "./useFeeTokenSelection"
import { useMultisigActionScreen } from "./useMultisigActionScreen"
import { useTransactionReviewV2 } from "./useTransactionReviewV2"
import { getRelatedTokensFromReview } from "./utils/getAmpliPayloadFromReview"
import { parseTransferTokenCall } from "./utils/parseTransferTokenCall"
import { sanitizeAccountType } from "../../../../shared/utils/sanitizeAccountType"
import { AirGapReviewButtonContainer } from "../transaction/airgap/AirGapReviewButton"

export interface TransactionActionScreenContainerProps
  extends ConfirmScreenProps {
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
}

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

  const [hasSentTransactionReviewedEvent, setHasSentTransactionReviewedEvent] =
    useState(false)

  const feeTokens = useFeeTokenBalances(selectedAccount)
  const defaultFeeToken = useDefaultFeeToken(selectedAccount)
  const [feeToken, setFeeToken] = useState<TokenWithBalance>(defaultFeeToken)

  const [isFeeTokenSelectionReady, setIsFeeTokenSelectionReady] =
    useState(false)

  const {
    data: transactionReview,
    error,
    isValidating: transactionReviewLoading,
  } = useTransactionReviewV2({
    calls: action.payload.transactions,
    actionHash: action.meta.hash,
    feeTokenAddress: feeToken?.address,
    selectedAccount,
    appDomain: action.meta.origin,
  })

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

  const isRejectOnChain = useMemo(
    () =>
      action.payload.meta?.type ===
      MultisigTransactionType.MULTISIG_REJECT_ON_CHAIN,
    [action],
  )

  useEffect(() => {
    if (!transactionReviewLoading && !hasSentTransactionReviewedEvent) {
      ampli.transactionReviewed({
        host: action.meta.origin,
        "simulation succeeded": Boolean(transactionReview && !error),
        "transaction type":
          action?.payload?.meta?.ampliProperties?.["transaction type"] ??
          "dapp",
        "wallet platform": "browser extension",
        "simulation error message": error?.message,
        "simulation error label":
          getPrettyRpcError(getMessageFromTrpcError(error)) ??
          "Tx not executed",
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
  ])

  const onSubmit = useCallback(async () => {
    const result = await approve()

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
      })
    }

    if (action?.payload?.meta?.ampliProperties) {
      void ampli.transactionSubmitted(action.payload.meta.ampliProperties)
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
      closePopupIfLastAction()
      if (location.pathname === routes.swap()) {
        navigate(routes.accountActivity())
      }
    }
  }, [
    approve,
    action.meta.title,
    action.meta.origin,
    action?.payload?.meta?.ampliProperties,
    transactionReview?.transactions,
    selectedAccount,
    rejectDeployIfPresent,
    closePopupIfLastAction,
    navigate,
    isRejectOnChain,
    action.payload.transactionsDetail?.nonce,
  ])

  useEffect(() => {
    void updateTransactionReview(transactionReview)
  }, [transactionReview, updateTransactionReview])

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
      <Label prefix="Tx not executed: " label={rpcMessage} />
    ) : (
      "Tx not executed"
    )
    return <ActionScreenErrorFooter title={title} errorMessage={message} />
  }, [error])

  const transactionReviewSimulationError = useMemo(() => {
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
  }, [transactionReview])

  const rejectOnChainBanner = useMemo(() => {
    if (!isRejectOnChain) {
      return null
    }
    return (
      <P4
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
      </P4>
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

    return (
      <TransactionReviewSimulation
        simulation={lastSimulation}
        networkId={networkId}
      />
    )
  }, [transactionReview, isRejectOnChain, networkId])

  const transactionReviewActions = useMemo(() => {
    if (isRejectOnChain) {
      return (
        <P4
          background={"neutrals.800"}
          borderRadius={"md"}
          fontWeight={"semibold"}
          display={"flex"}
          justifyContent={"space-between"}
          p={3}
        >
          On-chain rejection
        </P4>
      )
    }
    return transactionReview?.transactions.map((transaction, index) => {
      return (
        <TransactionReviewActions
          key={`review-${index}`}
          reviewOfTransaction={transaction.reviewOfTransaction}
          initiallyExpanded={false}
          networkId={networkId}
        />
      )
    })
  }, [isRejectOnChain, networkId, transactionReview?.transactions])

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
      <NavigationBarAccountDetailsContainer />
      <Divider color="neutrals.700" />
    </>
  )
  const actionIsApproving = Boolean(action.meta.startedApproving)

  const onSubmitWithLedger = async () => {
    await clearLastActionError()
    onLedgerApprovalOpen()

    void onSubmit()
  }

  const { multisig, multisigBanner, signerIsInMultisig } =
    useMultisigActionScreen()

  // Disable fee token selection if the transaction is an upgrade transaction
  const allowFeeTokenSelection =
    !isUpgradeTransaction && classHashSupportsTxV3(selectedAccount?.classHash)

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
    async (token: BaseToken) => {
      await feeTokenService.preferFeeToken(token.address)
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
          const balance = await clientTokenService.fetchTokenBalance(
            transferToken.address,
            selectedAccount.address as Address,
            selectedAccount.networkId,
          )

          const deductMaxFeeFromMaxAmount = isEqualAddress(
            tokenAddress,
            token.address,
          )

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
          const formattedMaxAmount = formatUnits(
            maxAmount,
            transferToken.decimals,
          )

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
      feeTokens,
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

    if (askForConfirmation) {
      onConfirmationModalOpen()
      return
    }

    if (isLedgerSigner) {
      return onSubmitWithLedger()
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
      {selectedAccount &&
        transactionReview?.enrichedFeeEstimation &&
        isFeeTokenSelectionReady && (
          <FeeEstimationContainerV2
            onErrorChange={setDisableConfirm}
            onFeeErrorChange={onShowAddFunds}
            transactionSimulationLoading={transactionReviewLoading}
            fee={transactionReview.enrichedFeeEstimation}
            feeToken={feeToken}
            networkId={selectedAccount.networkId}
            accountAddress={selectedAccount.address}
            needsDeploy={selectedAccount.needsDeploy}
            onOpenFeeTokenPicker={() => setIsFeeTokenPickerOpen(true)}
            allowFeeTokenSelection={allowFeeTokenSelection}
            error={error}
            isSendingMoreThanBalanceAndGas={
              transactionReview?.isSendingMoreThanBalanceAndGas
            }
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

  const confirmButtonDisabled =
    disableConfirm || (isHighRisk && !hasAcceptedRisk) || disableLedgerApproval

  return (
    <WithSmartAccountVerified transactions={action.payload.transactions}>
      <ConfirmScreen
        navigationBar={navigationBar}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonDisabled={confirmButtonDisabled}
        confirmButtonText={confirmButtonText}
        onSubmit={onSubmitWithChecks}
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
            transactionReview?.transactions[0]?.reviewOfTransaction
              ?.targetedDapp?.logoUrl
          }
          subtitle={action.meta?.subtitle ?? action.meta.origin}
          dappHost={action.meta.origin}
          iconKey={action.meta?.icon}
        />
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
              estimatedFees={transactionReview?.enrichedFeeEstimation}
              nonce={rejectOnChainNonce}
            />
          </>
        )}
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
      {isLedgerSigner && transactionReview?.enrichedFeeEstimation && (
        <LedgerActionModal
          isOpen={isLedgerApprovalOpen}
          onClose={onLedgerApprovalClose}
          onSubmit={onSubmit}
          errorMessage={ledgerErrorMessage}
          account={selectedAccount}
          transactions={action.payload.transactions}
          estimatedFees={transactionReview.enrichedFeeEstimation}
          nonce={rejectOnChainNonce}
        />
      )}
    </WithSmartAccountVerified>
  )
}
