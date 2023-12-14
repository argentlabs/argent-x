import { FC, useCallback, useMemo, useState } from "react"

import { useTransactionReviewV2 } from "./useTransactionReviewV2"
import { useActionScreen } from "../hooks/useActionScreen"
import { TransactionReviewActions } from "./action/TransactionReviewActions"
import { AccountDetails } from "./TransactionHeader/AccountDetails"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
} from "@chakra-ui/react"
import { isArray } from "lodash-es"
import { TransactionHeader } from "./TransactionHeader"
import { WarningBanner } from "./warning/WarningBanner"
import { FeeEstimationContainerV2 } from "./FeeEstimationContainerV2"
import { isEmpty, isObject } from "lodash-es"
import { routes } from "../../../routes"
import { useNavigate } from "react-router-dom"
import { ReviewFallback } from "./ReviewFallback"
import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { WithArgentShieldVerified } from "../../shield/WithArgentShieldVerified"
import { useAtom } from "jotai"
import { userClickedAddFundsAtom } from "../../../views/actions"
import { WaitingForFunds } from "../feeEstimation/ui/WaitingForFunds"
import { useMultisigActionScreen } from "./useMultisigActionScreen"
import { TransactionReviewSimulation } from "./simulation/TransactionReviewSimulation"
import { ListSkeleton } from "../../../components/ScreenSkeleton"
import { TransactionReviewSummaryStack } from "./simulation/summary/TransactionReviewSummaryStack"
import { AccordionIcon, B3, P4, icons } from "@argent/ui"
import { getMessageFromTrpcError } from "../../../../shared/errors/schema"
import {
  getMessageFromSimulationError,
  isNotTransactionSimulationError,
  isTransactionSimulationError,
} from "../../../../shared/transactionReview/schema"
import { TransactionReviewLabel } from "./TransactionReviewLabel"

const { AlertIcon } = icons

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

  const navigate = useNavigate()
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [userClickedAddFunds, setUserClickedAddFunds] = useAtom(
    userClickedAddFundsAtom,
  )

  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      closePopupIfLastAction()
      if (location.pathname === routes.swap()) {
        navigate(routes.accountActivity())
      }
    }
  }, [closePopupIfLastAction, navigate, approve])

  const {
    data: transactionReview,
    error,
    isValidating,
  } = useTransactionReviewV2({
    calls: action.payload.transactions,
    actionHash: action.meta.hash,
  })

  const loadingOrErrorState = useMemo(() => {
    if (error) {
      console.warn("error", error)
      const message = getMessageFromTrpcError(error)
      return (
        <TransactionReviewSummaryStack bg="error.900">
          <B3 color="text" py={1}>
            Transaction failure predicted
          </B3>
          {message && (
            <P4 color="errorText" whiteSpace="pre-wrap">
              {message}
            </P4>
          )}
        </TransactionReviewSummaryStack>
      )
    }
    if (!transactionReview) {
      return <ListSkeleton px={0} />
    }
    return null
  }, [error, transactionReview])

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
    const lastSimulation = txSimulationErrors?.[txSimulationErrors.length - 1]
    if (!lastSimulation) {
      return null
    }

    const errorMessage = getMessageFromSimulationError(lastSimulation)

    return (
      <Accordion size="sm" colorScheme="error" boxShadow={"menu"} allowToggle>
        <AccordionItem>
          <AccordionButton>
            <AlertIcon display={"inline-block"} fontSize={"base"} mr={1} />{" "}
            <Box as="span" flex="1" textAlign="left">
              <TransactionReviewLabel label={lastSimulation.label} />
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>{errorMessage}</AccordionPanel>
        </AccordionItem>
      </Accordion>
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

  const transactionReviewWarnings = useMemo(() => {
    return transactionReview?.transactions.flatMap((transaction, index) => {
      if (isEmpty(transaction.reviewOfTransaction?.warnings)) {
        return false
      }
      return (
        <>
          {transaction.reviewOfTransaction?.warnings?.map((warnings) => (
            <WarningBanner
              key={`warning-${index}-${warnings.reason}`}
              reason={warnings.reason}
              severity={warnings.severity}
            />
          ))}
        </>
      )
    })
  }, [transactionReview])

  const transactionReviewFallback = useMemo(
    () =>
      transactionReview?.isBackendDown && (
        <ReviewFallback
          calls={
            isArray(action.payload.transactions)
              ? action.payload.transactions
              : [action.payload.transactions]
          }
        />
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
    void onSubmit()
  }

  const footer = userClickedAddFunds ? (
    <WaitingForFunds />
  ) : (
    <WithActionScreenErrorFooter isTransaction>
      {selectedAccount && transactionReview?.enrichedFeeEstimation && (
        <FeeEstimationContainerV2
          onErrorChange={setDisableConfirm}
          onFeeErrorChange={onShowAddFunds}
          transactionSimulationLoading={isValidating}
          fee={transactionReview?.enrichedFeeEstimation}
          networkId={selectedAccount.networkId}
          accountAddress={selectedAccount.address}
          needsDeploy={selectedAccount.needsDeploy}
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
        confirmButtonDisabled={disableConfirm}
        confirmButtonText={confirmButtonText}
        onSubmit={onSubmitWithChecks}
        showHeader={true}
        onReject={() => void reject()}
        footer={footer}
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
    </WithArgentShieldVerified>
  )
}
