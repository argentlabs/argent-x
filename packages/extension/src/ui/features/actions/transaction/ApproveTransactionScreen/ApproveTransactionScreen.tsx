import { P4 } from "@argent/ui"
import { WarningIcon } from "@chakra-ui/icons"
import { Center, Collapse } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { normalizeAddress } from "../../../../services/addresses"
import { MultisigPendingTxModal } from "../../../multisig/MultisigPendingTxModal"
import { AccountNetworkInfoArgentX } from "./AccountNetworkInfoArgentX"
import { BalanceChangeOverviewArgentX } from "./BalanceChangeOverviewArgentX"
import { ConfirmScreen } from "./ConfirmScreen"
import { DappHeaderArgentX } from "./DappHeader/DappHeaderArgentX"
import { MultisigBanner } from "./MultisigBanner"
import { SimulationLoadingBanner } from "./SimulationLoadingBanner"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"
import { ApproveTransactionScreenProps } from "./approveTransactionScreen.model"

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  actionHash,
  actionIsApproving,
  aggregatedData,
  declareOrDeployType,
  disableConfirm,
  isMainnet,
  isSimulationLoading,
  onSubmit,
  selectedAccount,
  multisig,
  transactionReview,
  transactions,
  transactionSimulation,
  approveScreenType,
  hasPendingMultisigTransactions,
  onReject,
  multisigModalDisclosure,
  showFraudMonitorBanner,
  hasBalanceChange,
  showTransactionActions,
  transactionActionsType,
  assessmentReason,
  showTxDetails,
  setShowTxDetails,
  confirmButtonText = "Confirm",
  multisigBannerProps,
  onConfirmAnyway,
  ...rest
}) => {
  const showTxActions =
    !isSimulationLoading && showTransactionActions && transactionActionsType
  return (
    <Suspense fallback={null}>
      <ConfirmScreen
        confirmButtonText={confirmButtonText}
        confirmButtonIsLoading={actionIsApproving}
        confirmButtonLoadingText={confirmButtonText}
        rejectButtonText="Cancel"
        confirmButtonDisabled={disableConfirm}
        selectedAccount={selectedAccount}
        onSubmit={() => {
          if (hasPendingMultisigTransactions) {
            multisigModalDisclosure.onOpen()
          } else {
            onSubmit(transactions)
          }
        }}
        showHeader={true}
        onReject={onReject}
        {...rest}
      >
        {/** Use Transaction Review to get DappHeader */}
        <DappHeaderArgentX
          transactions={transactions}
          transactionReview={transactionReview}
          aggregatedData={aggregatedData}
          approveScreenType={approveScreenType}
        />
        {showFraudMonitorBanner && (
          <TransactionBanner
            variant={transactionReview?.assessment}
            icon={WarningIcon}
            message={assessmentReason}
          />
        )}

        {multisig && <MultisigBanner {...multisigBannerProps} />}

        {hasBalanceChange ? (
          <BalanceChangeOverviewArgentX
            aggregatedData={aggregatedData}
            transactionReview={transactionReview}
          />
        ) : (
          isSimulationLoading && <SimulationLoadingBanner />
        )}

        <Collapse in={showTransactionActions} animateOpacity>
          {showTxActions && (
            <TransactionActions action={transactionActionsType} />
          )}
        </Collapse>

        <AccountNetworkInfoArgentX
          account={selectedAccount}
          to={
            transactionReview?.reviews[0].activity?.recipient
              ? normalizeAddress(
                  transactionReview?.reviews[0].activity?.recipient,
                )
              : undefined
          }
        />
        {multisig && multisigModalDisclosure.isOpen && (
          <MultisigPendingTxModal
            isOpen={multisigModalDisclosure.isOpen}
            onConfirm={() =>
              onConfirmAnyway
                ? onConfirmAnyway(transactions)
                : onSubmit(transactions)
            }
            onClose={multisigModalDisclosure.onClose}
            noOfOwners={multisig.threshold}
          />
        )}

        {hasBalanceChange && (
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
