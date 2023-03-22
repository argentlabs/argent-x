import { WarningIcon } from "@chakra-ui/icons"
import { isArray, isEmpty } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import {
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  getDisplayWarnAndReasonForTransactionReview,
} from "../../../../../shared/transactionReview.service"
import { ApiTransactionSimulationResponse } from "../../../../../shared/transactionSimulation/types"
import { routes } from "../../../../routes"
import { normalizeAddress } from "../../../../services/addresses"
import { usePageTracking } from "../../../../services/analytics"
import { Account } from "../../../accounts/Account"
import { useAccountTransactions } from "../../../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../../../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../../../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../../../accountTokens/tokens.service"
import { useIsMainnet } from "../../../networks/useNetworks"
import { ConfirmPageProps } from "../../DeprecatedConfirmScreen"
import { CombinedFeeEstimation } from "../../feeEstimation/CombinedFeeEstimation"
import { FeeEstimation } from "../../feeEstimation/FeeEstimation"
import { useTransactionReview } from "../useTransactionReview"
import {
  AggregatedSimData,
  useAggregatedSimData,
} from "../useTransactionSimulatedData"
import { useTransactionSimulation } from "../useTransactionSimulation"
import { AccountNetworkInfo } from "./AccountNetworkInfo"
import { BalanceChangeOverview } from "./BalanceChangeOverview"
import { ConfirmScreen, ConfirmScreenProps } from "./ConfirmScreen"
import { DappHeader } from "./DappHeader"
import { SimulationLoadingBanner } from "./SimulationLoadingBanner"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"

const VERIFIED_DAPP_ENABLED = process.env.FEATURE_VERIFIED_DAPPS === "true"

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  declareOrDeployType?: "declare" | "deploy"
  onSubmit: (transactions: Call | Call[]) => void
  selectedAccount?: Account
  transactions: Call | Call[]
}

export interface ApproveTransactionProps
  extends ApproveTransactionScreenProps,
    Omit<ConfirmScreenProps, "onSubmit"> {
  aggregatedData: AggregatedSimData[]
  isMainnet: boolean
  isSimulationLoading: boolean
  transactionReview?: ApiTransactionReviewResponse
  transactionSimulation?: ApiTransactionSimulationResponse
  selectedAccount: Account
  disableConfirm: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactions,
  selectedAccount,
  actionHash,
  ...rest
}) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)
  const isMainnet = useIsMainnet()

  const { data: transactionReview } = useTransactionReview({
    account: selectedAccount,
    transactions,
    actionHash,
  })
  const { data: transactionSimulation, isValidating: isSimulationValidating } =
    useTransactionSimulation({
      account: selectedAccount,
      transactions,
      actionHash,
    })

  const isSimulationLoading = isSimulationValidating && !transactionSimulation

  const aggregatedData = useAggregatedSimData(transactionSimulation)

  const { feeTokenBalance } = useFeeTokenBalance(selectedAccount)

  const { needsUpgrade = false } = useCheckUpgradeAvailable(selectedAccount)
  const { pendingTransactions } = useAccountTransactions(selectedAccount)

  const isUpgradeTransaction =
    !Array.isArray(transactions) && transactions.entrypoint === "upgrade"
  const hasUpgradeTransactionPending = pendingTransactions.some(
    (t) => t.meta?.isUpgrade,
  )
  const shouldShowUpgrade = Boolean(
    needsUpgrade &&
      feeTokenBalance?.gt(0) &&
      !hasUpgradeTransactionPending &&
      !isUpgradeTransaction,
  )

  const verifiedDapp =
    (VERIFIED_DAPP_ENABLED && isMainnet && transactionReview?.targetedDapp) ||
    undefined

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4 upgradeType="account" {...rest} />
  }

  return (
    <ApproveTransaction
      actionHash={actionHash}
      aggregatedData={aggregatedData}
      disableConfirm={disableConfirm}
      isMainnet={isMainnet}
      isSimulationLoading={isSimulationLoading}
      selectedAccount={selectedAccount}
      transactionReview={transactionReview}
      transactions={transactions}
      transactionSimulation={transactionSimulation}
      verifiedDapp={verifiedDapp}
      footer={
        selectedAccount.needsDeploy ? (
          <CombinedFeeEstimation
            onErrorChange={setDisableConfirm}
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
            transactions={transactions}
            actionHash={actionHash}
          />
        ) : (
          <FeeEstimation
            onErrorChange={setDisableConfirm}
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
            transactions={transactions}
            actionHash={actionHash}
          />
        )
      }
      {...rest}
    />
  )
}

export const ApproveTransaction: FC<ApproveTransactionProps> = ({
  actionHash,
  aggregatedData,
  declareOrDeployType,
  disableConfirm,
  isMainnet,
  isSimulationLoading,
  onSubmit,
  selectedAccount,
  transactionReview,
  transactions,
  transactionSimulation,
  verifiedDapp,
  ...rest
}) => {
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
    () => Boolean(declareOrDeployType),
    [declareOrDeployType],
  )

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
        onSubmit(transactions)
      }}
      showHeader={true}
      {...rest}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeader
        transactions={transactionsArray}
        transactionReview={transactionReview}
        aggregatedData={aggregatedData}
        verifiedDapp={verifiedDapp || undefined}
        declareOrDeployType={declareOrDeployType}
      />

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
        <TransactionActions transactions={transactionsArray} />
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
    </ConfirmScreen>
  )
}
