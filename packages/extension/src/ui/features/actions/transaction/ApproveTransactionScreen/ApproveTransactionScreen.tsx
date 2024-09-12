import { FC, Suspense, useEffect, useMemo, useState } from "react"

import {
  ReviewOfTransaction,
  getHighestSeverity,
  isNotTransactionSimulationError,
  warningSchema,
} from "@argent/x-shared/simulation"
import { IconDeprecatedKeys, P4 } from "@argent/x-ui"
import {
  TransactionReviewActions,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import { Center, Collapse } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { z } from "zod"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { useActionScreen } from "../../hooks/useActionScreen"
import { TransactionHeader } from "../../transactionV2/header"
import { WarningBanner } from "../../warning/WarningBanner"

import { MultisigConfirmationsBanner } from "../MultisigConfirmationsBanner"
import { AirGapReviewButtonContainer } from "../airgap/AirGapReviewButton"
import { ConfirmScreen } from "./ConfirmScreen"
import { DappHeaderArgentX } from "./DappHeader/DappHeaderArgentX"
import { TransactionActions } from "./TransactionActions"
import { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"
import { LedgerActionModal } from "./ledger/LedgerActionModal"

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  actionHash,
  actionIsApproving,
  aggregatedData,
  disableConfirm,
  isMainnet,
  isSimulationLoading,
  onSubmit,
  selectedAccount,
  multisig,
  transactionReview,
  transactions,
  approveScreenType,
  hasPendingMultisigTransactions,
  onReject,
  hasBalanceChange,
  showTransactionActions,
  transactionActionsType,
  showTxDetails,
  setShowTxDetails,
  confirmButtonText = "Confirm",
  multisigBannerProps,
  onConfirmAnyway,
  transactionAction,
  ledgerActionModalDisclosure,
  ledgerErrorMessage,
  isRejectOnChain,
  isUpgradeAccount,
  nonce,
  txNeedsRetry,
  ...rest
}) => {
  const { action } = useActionScreen()
  const [hasAcceptedRisk, setHasAcceptedRisk] = useState(false)
  const [isHighRisk, setIsHighRisk] = useState(false)
  const networkId = useCurrentNetwork().id

  const reviewOfTransaction: ReviewOfTransaction = useMemo(() => {
    if (transactionReview && transactionReview.transactions[0]) {
      return transactionReview.transactions[0].reviewOfTransaction
    }
  }, [transactionReview])

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
  }, [isRejectOnChain, transactionReview?.transactions, networkId])

  const warnings = useMemo(
    () =>
      transactionReview?.transactions.flatMap((transaction) => {
        return transaction.reviewOfTransaction?.warnings
      }),
    [transactionReview],
  )
  const confirmButtonLabel = txNeedsRetry ? "Retry" : confirmButtonText

  const warningsWithoutUndefined = useMemo(
    () =>
      z
        .array(warningSchema)
        .safeParse(
          warnings?.filter(
            (warning) => !isEmpty(warning) && warning !== undefined,
          ),
        ),
    [warnings],
  )

  const highestSeverityWarning = useMemo(
    () =>
      warningsWithoutUndefined.success &&
      getHighestSeverity(warningsWithoutUndefined.data),
    [warningsWithoutUndefined],
  )

  useEffect(() => {
    if (
      highestSeverityWarning &&
      (highestSeverityWarning.severity === "critical" ||
        highestSeverityWarning.severity === "high")
    ) {
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
        onReject={() => onReject && void onReject()}
        onConfirm={() => setHasAcceptedRisk(true)}
      />
    )
  }, [warningsWithoutUndefined, onReject])

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

  const onConfirm = () => {
    return onConfirmAnyway
      ? onConfirmAnyway(transactionAction)
      : onSubmit(transactionAction)
  }

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

    return (
      <TransactionReviewSimulation
        simulation={lastSimulation}
        networkId={networkId}
      />
    )
  }, [transactionReview, networkId])

  const { title, subtitle, dappLogoUrl, dappHost, iconKey } = useMemo(() => {
    if (isRejectOnChain) {
      return {
        title: "On-chain rejection",
        iconKey: "CloseIcon" as IconDeprecatedKeys,
      }
    }
    if (isUpgradeAccount) {
      return {
        title: "Upgrade account",
        iconKey: "UpgradeIcon" as IconDeprecatedKeys,
      }
    }
    if (action) {
      return {
        title: action.meta?.title,
        subtitle: action.meta?.subtitle ?? action.meta.origin,
        dappLogoUrl:
          transactionReview?.transactions[0]?.reviewOfTransaction?.targetedDapp
            ?.logoUrl,
        dappHost: action.meta.origin,
        iconKey: action.meta?.icon as IconDeprecatedKeys,
      }
    }
    return {}
  }, [
    action,
    isRejectOnChain,
    isUpgradeAccount,
    transactionReview?.transactions,
  ])

  return (
    <Suspense fallback={null}>
      <ConfirmScreen
        confirmButtonText={confirmButtonLabel}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonLoadingText={confirmButtonText}
        rejectButtonText={"Cancel"}
        confirmButtonDisabled={
          disableConfirm || (isHighRisk && !hasAcceptedRisk)
        }
        selectedAccount={selectedAccount}
        onSubmit={() => {
          onSubmit(transactionAction)
        }}
        showHeader={true}
        onReject={onReject}
        {...rest}
      >
        {/** Use Transaction Review to get DappHeader */}
        {!isRejectOnChain && !isUpgradeAccount && (
          <DappHeaderArgentX
            transactions={transactions}
            transactionReview={reviewOfTransaction}
            aggregatedData={aggregatedData}
            approveScreenType={approveScreenType}
          />
        )}
        {(action || isRejectOnChain || isUpgradeAccount) && (
          <TransactionHeader
            px={0}
            title={title}
            dappLogoUrl={dappLogoUrl}
            subtitle={subtitle}
            dappHost={dappHost}
            iconKey={iconKey}
          />
        )}
        {rejectOnChainBanner}
        {multisigBannerProps && (
          <MultisigConfirmationsBanner {...multisigBannerProps} />
        )}
        {transactionReviewWarnings}
        {!isRejectOnChain && (
          <>
            {transactionReviewSimulation}
            <Collapse
              in={showTransactionActions && !transactionReview}
              animateOpacity
            >
              {transactionActionsType && (
                <TransactionActions
                  action={transactionActionsType}
                  networkId={networkId}
                />
              )}
            </Collapse>
          </>
        )}
        {transactionReviewActions}
        <AirGapReviewButtonContainer
          transactions={transactions}
          estimatedFees={transactionReview?.enrichedFeeEstimation}
          selectedAccount={selectedAccount}
          nonce={nonce}
        />
        {ledgerActionModalDisclosure?.isOpen && (
          <LedgerActionModal
            isOpen={ledgerActionModalDisclosure.isOpen}
            transactions={transactions}
            estimatedFees={transactionReview?.enrichedFeeEstimation}
            nonce={nonce}
            onClose={ledgerActionModalDisclosure.onClose}
            onSubmit={onConfirm}
            errorMessage={ledgerErrorMessage}
            account={selectedAccount}
          />
        )}
        {hasBalanceChange && !transactionReview && (
          <Center mb="3" mt="2">
            <P4
              fontWeight="bold"
              _hover={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => setShowTxDetails(!showTxDetails)}
            >
              {showTxDetails ? "Hide" : "View more"} details
            </P4>
          </Center>
        )}
      </ConfirmScreen>
    </Suspense>
  )
}
