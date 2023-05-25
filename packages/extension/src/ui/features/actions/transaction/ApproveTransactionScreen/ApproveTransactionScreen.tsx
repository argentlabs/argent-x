import { WarningIcon } from "@chakra-ui/icons"
import { useDisclosure } from "@chakra-ui/react"
import { isArray, isEmpty } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import {
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  getDisplayWarnAndReasonForTransactionReview,
} from "../../../../../shared/transactionReview.service"
import { ApiTransactionSimulationResponse } from "../../../../../shared/transactionSimulation/types"
import { normalizeAddress } from "../../../../services/addresses"
import { Account } from "../../../accounts/Account"
import { Multisig } from "../../../multisig/Multisig"
import { MultisigPendingTxModal } from "../../../multisig/MultisigPendingTxModal"
import { ApproveScreenType, TransactionActionsType } from "../types"
import { AggregatedSimData } from "../useTransactionSimulatedData"
import { AccountNetworkInfo } from "./AccountNetworkInfo"
import { ApproveTransactionScreenContainerProps } from "./ApproveTransactionScreenContainer"
import { BalanceChangeOverview } from "./BalanceChangeOverview"
import { ConfirmScreen, ConfirmScreenProps } from "./ConfirmScreen"
import { DappHeader } from "./DappHeader"
import { MultisigBanner } from "./MultisigBanner"
import { SimulationLoadingBanner } from "./SimulationLoadingBanner"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"

export interface ApproveTransactionScreenProps
  extends ApproveTransactionScreenContainerProps,
    Omit<ConfirmScreenProps, "onSubmit"> {
  aggregatedData: AggregatedSimData[]
  isMainnet: boolean
  isSimulationLoading: boolean
  transactionReview?: ApiTransactionReviewResponse
  transactionSimulation?: ApiTransactionSimulationResponse
  selectedAccount: Account
  disableConfirm: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  hasPendingMultisigTransactions: boolean
  multisig?: Multisig
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  actionHash,
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
  verifiedDapp,
  approveScreenType,
  hasPendingMultisigTransactions,
  onReject,
  ...rest
}) => {
  const {
    isOpen: isMultisigModalOpen,
    onOpen: onMultisigModalOpen,
    onClose: onMultisigModalClose,
  } = useDisclosure()

  const transactionsArray: Call[] = useMemo(
    () => (isArray(transactions) ? transactions : [transactions]),
    [transactions],
  )

  const txnHasTransfers = useMemo(
    () => !isEmpty(transactionSimulation?.transfers),
    [transactionSimulation],
  )

  const txnHasApprovals = useMemo(
    () => !isEmpty(transactionSimulation?.approvals),
    [transactionSimulation],
  )

  const isUdcAction = useMemo(
    () =>
      approveScreenType === ApproveScreenType.DECLARE ||
      approveScreenType === ApproveScreenType.DEPLOY,
    [approveScreenType],
  )

  const transactionActionsType: TransactionActionsType = useMemo(() => {
    if (approveScreenType === ApproveScreenType.ADD_ARGENT_SHIELD) {
      return {
        type: "ADD_ARGENT_SHIELD",
        payload: {
          accountAddress: selectedAccount.address,
        },
      }
    }

    if (approveScreenType === ApproveScreenType.REMOVE_ARGENT_SHIELD) {
      return {
        type: "REMOVE_ARGENT_SHIELD",
        payload: {
          accountAddress: selectedAccount.address,
        },
      }
    }

    return {
      type: "INVOKE_FUNCTION",
      payload: transactionsArray,
    }
  }, [approveScreenType, selectedAccount.address, transactionsArray])

  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)

  // Show balance change if there is a transaction simulation and there are approvals or transfers
  const hasBalanceChange =
    transactionSimulation && (txnHasTransfers || txnHasApprovals)

  // Show actions if there is no balance change or if there is a balance change and the user has expanded the details
  const showTransactionActions = !isUdcAction

  return (
    <ConfirmScreen
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        if (hasPendingMultisigTransactions) {
          onMultisigModalOpen()
        } else {
          onSubmit(transactions)
        }
      }}
      showHeader={true}
      onReject={onReject}
      {...rest}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeader
        transactions={transactionsArray}
        transactionReview={transactionReview}
        aggregatedData={aggregatedData}
        verifiedDapp={verifiedDapp || undefined}
        approveScreenType={approveScreenType}
      />
      {multisig && (
        <MultisigBanner account={selectedAccount} confirmations={1} />
      )}
      {warn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      )}

      {hasBalanceChange ? (
        <BalanceChangeOverview
          aggregatedData={aggregatedData}
          transactionReview={transactionReview}
        />
      ) : (
        isSimulationLoading && <SimulationLoadingBanner />
      )}
      {showTransactionActions && (
        <TransactionActions action={transactionActionsType} />
      )}

      <AccountNetworkInfo
        account={selectedAccount}
        to={
          transactionReview?.reviews[0].activity?.recipient
            ? normalizeAddress(
                transactionReview?.reviews[0].activity?.recipient,
              )
            : undefined
        }
      />
      {multisig && isMultisigModalOpen && (
        <MultisigPendingTxModal
          isOpen={isMultisigModalOpen}
          onConfirm={() => onSubmit(transactions)}
          onClose={onMultisigModalClose}
          noOfOwners={multisig.threshold}
        />
      )}
    </ConfirmScreen>
  )
}
