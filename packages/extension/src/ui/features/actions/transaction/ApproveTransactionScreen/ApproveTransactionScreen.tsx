import type { FC } from "react"
import { Suspense, useEffect, useMemo, useState } from "react"

import {
  getHighestSeverity,
  isNotTransactionSimulationError,
  warningSchema,
} from "@argent/x-shared/simulation"
import type { IconKeys } from "@argent/x-ui"
import { P3 } from "@argent/x-ui"
import {
  TransactionReviewActions,
  TransactionReviewSimulation,
} from "@argent/x-ui/simulation"
import { isEmpty } from "lodash-es"
import { z } from "zod"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { useActionScreen } from "../../hooks/useActionScreen"
import { TransactionHeader } from "../../transactionV2/header"
import { WarningBanner } from "../../warning/WarningBanner"

import { getReviewOfTransaction } from "../../../../../shared/transactionReview.service"
import { useView } from "../../../../views/implementation/react"
import { transactionHashFindAtom } from "../../../../views/transactionHashes"
import { MultisigConfirmationsBanner } from "../MultisigConfirmationsBanner"
import { AirGapReviewButtonContainer } from "../airgap/AirGapReviewButton"
import { ConfirmScreen } from "./ConfirmScreen"
import type { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"
import { getTransactionIcon } from "../getTransactionIcon"
import { getTransactionTitle } from "../getTransactionTitle"
import { LedgerActionModal } from "./ledger/LedgerActionModal"

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  actionHash,
  actionIsApproving,
  disableConfirm,
  isMainnet,
  onSubmit,
  selectedAccount,
  multisig,
  transactionReview,
  transactions,
  approveScreenType,
  hasPendingMultisigTransactions,
  onReject,
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
    return transactionReview?.transactions?.map((transaction, index) => {
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
      transactionReview?.transactions?.flatMap((transaction) => {
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

  const onConfirm = () => {
    return onConfirmAnyway
      ? onConfirmAnyway(transactionAction)
      : onSubmit(transactionAction)
  }

  const transactionReviewSimulation = useMemo(() => {
    if (!transactionReview) {
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
        iconKey: "CrossSecondaryIcon" as IconKeys,
      }
    }
    if (isUpgradeAccount) {
      return {
        title: "Upgrade account",
        iconKey: "UpgradeSecondaryIcon" as IconKeys,
      }
    }
    if (action) {
      return {
        title: action.meta?.title,
        subtitle: action.meta?.subtitle ?? action.meta.origin,
        dappLogoUrl:
          transactionReview?.transactions?.[0]?.reviewOfTransaction
            ?.targetedDapp?.logoUrl,
        dappHost: action.meta.origin,
        iconKey: action.meta?.icon,
      }
    }
    // Default case: extract data from transactionReview
    const reviewOfTransaction = getReviewOfTransaction(transactionReview)
    const targetedDappWebsite = reviewOfTransaction?.targetedDapp?.links.find(
      (l) => l.name === "website",
    )

    return {
      title: getTransactionTitle(approveScreenType, transactionReview),
      subtitle: targetedDappWebsite?.url,
      dappLogoUrl: reviewOfTransaction?.targetedDapp?.logoUrl,
      dappHost: targetedDappWebsite?.url,
      iconKey: getTransactionIcon(approveScreenType, transactionReview),
    }
  }, [
    action,
    approveScreenType,
    isRejectOnChain,
    isUpgradeAccount,
    transactionReview,
  ])

  const txHash = useView(transactionHashFindAtom(actionHash))

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
        <TransactionHeader
          px={0}
          title={title}
          dappLogoUrl={dappLogoUrl}
          subtitle={subtitle}
          dappHost={dappHost}
          iconKey={iconKey}
        />
        {rejectOnChainBanner}
        {multisigBannerProps && (
          <MultisigConfirmationsBanner {...multisigBannerProps} />
        )}
        {transactionReviewWarnings}
        {!isRejectOnChain && <>{transactionReviewSimulation}</>}
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
            onClose={ledgerActionModalDisclosure.onClose}
            onSubmit={onConfirm}
            errorMessage={ledgerErrorMessage}
            account={selectedAccount}
            txHash={txHash}
          />
        )}
      </ConfirmScreen>
    </Suspense>
  )
}
