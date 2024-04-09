import { FC, Suspense, useEffect, useMemo, useState } from "react"

import { normalizeAddress } from "@argent/x-shared"
import { isEmpty } from "lodash-es"
import { z } from "zod"
import { getTransactionActionByType } from "../../../../../shared/transactionReview.service"
import {
  Property,
  ReviewOfTransaction,
  warningSchema,
} from "../../../../../shared/transactionReview/schema"
import { MultisigPendingTxModal } from "../../../multisig/MultisigPendingTxModal"
import { TransactionReviewActions } from "../../transactionV2/action/TransactionReviewActions"
import { WarningBanner } from "../../warning/WarningBanner"
import { AccountNetworkInfoArgentX } from "./AccountNetworkInfoArgentX"
import { BalanceChangeOverviewArgentX } from "./BalanceChangeOverviewArgentX"
import { ConfirmScreen } from "./ConfirmScreen"
import { DappHeaderArgentX } from "./DappHeader/DappHeaderArgentX"
import { MultisigBanner } from "./MultisigBanner"
import { SimulationLoadingBanner } from "./SimulationLoadingBanner"
import { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"
import { getHighestSeverity } from "../../warning/helper"
import { Center, Collapse } from "@chakra-ui/react"
import { TransactionActions } from "./TransactionActions"
import { P4 } from "@argent/x-ui"

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
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
  multisigModalDisclosure,
  hasBalanceChange,
  showTransactionActions,
  transactionActionsType,
  showTxDetails,
  setShowTxDetails,
  confirmButtonText = "Confirm",
  multisigBannerProps,
  onConfirmAnyway,
  transactionAction,
  ...rest
}) => {
  const [hasAcceptedRisk, setHasAcceptedRisk] = useState(false)
  const [isHighRisk, setIsHighRisk] = useState(false)

  const reviewOfTransaction: ReviewOfTransaction = useMemo(() => {
    if (transactionReview) {
      return transactionReview.transactions[0].reviewOfTransaction
    }
  }, [transactionReview])

  const recipientAddress = useMemo(() => {
    const action = getTransactionActionByType(
      "ERC20_transfer",
      reviewOfTransaction,
    )
    if (action) {
      const recipientProperty = [
        ...action.properties,
        ...(action.defaultProperties || []),
      ].find((p) => p.type === "address")
      if (recipientProperty) {
        const recipient = recipientProperty as Extract<
          Property,
          { type: "address" }
        >
        return normalizeAddress(recipient.address)
      }
    }

    return undefined
  }, [reviewOfTransaction])

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

  const warnings = useMemo(
    () =>
      transactionReview?.transactions.flatMap((transaction) => {
        return transaction.reviewOfTransaction?.warnings
      }),
    [transactionReview],
  )

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

  return (
    <Suspense fallback={null}>
      <ConfirmScreen
        confirmButtonText={confirmButtonText}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonLoadingText={confirmButtonText}
        rejectButtonText="Cancel"
        confirmButtonDisabled={
          disableConfirm || (isHighRisk && !hasAcceptedRisk)
        }
        selectedAccount={selectedAccount}
        onSubmit={() => {
          if (hasPendingMultisigTransactions) {
            multisigModalDisclosure.onOpen()
          } else {
            onSubmit(transactionAction)
          }
        }}
        showHeader={true}
        onReject={onReject}
        {...rest}
      >
        {/** Use Transaction Review to get DappHeader */}
        <DappHeaderArgentX
          transactions={transactions}
          transactionReview={reviewOfTransaction}
          aggregatedData={aggregatedData}
          approveScreenType={approveScreenType}
        />
        {multisig && <MultisigBanner {...multisigBannerProps} />}
        {transactionReviewWarnings}
        {hasBalanceChange ? (
          <BalanceChangeOverviewArgentX
            aggregatedData={aggregatedData}
            transactionReview={reviewOfTransaction}
          />
        ) : (
          isSimulationLoading && <SimulationLoadingBanner />
        )}
        <Collapse
          in={showTransactionActions && !transactionReview}
          animateOpacity
        >
          {transactionActionsType && (
            <TransactionActions action={transactionActionsType} />
          )}
        </Collapse>
        {transactionReviewActions}
        <AccountNetworkInfoArgentX
          account={selectedAccount}
          to={recipientAddress}
        />
        {multisig && multisigModalDisclosure.isOpen && (
          <MultisigPendingTxModal
            isOpen={multisigModalDisclosure.isOpen}
            onConfirm={() =>
              onConfirmAnyway
                ? onConfirmAnyway(transactionAction)
                : onSubmit(transactionAction)
            }
            onClose={multisigModalDisclosure.onClose}
            noOfOwners={multisig.threshold}
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
