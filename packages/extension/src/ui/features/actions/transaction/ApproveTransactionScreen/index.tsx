import { P4 } from "@argent/ui"
import { WarningIcon } from "@chakra-ui/icons"
import { Center } from "@chakra-ui/react"
import { isArray, isEmpty } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { getDisplayWarnAndReasonForTransactionReview } from "../../../../../shared/transactionReview.service"
import { routes } from "../../../../routes"
import { normalizeAddress } from "../../../../services/addresses"
import { usePageTracking } from "../../../../services/analytics"
import { useAccountTransactions } from "../../../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../../../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../../../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../../../accountTokens/tokens.service"
import { useIsMainnet } from "../../../networks/useNetworks"
import { ConfirmPageProps } from "../../DeprecatedConfirmScreen"
import { CombinedFeeEstimation } from "../../feeEstimation/CombinedFeeEstimation"
import { FeeEstimation } from "../../feeEstimation/FeeEstimation"
import { LoadingScreen } from "../../LoadingScreen"
import { useTransactionReview } from "../useTransactionReview"
import { useAggregatedSimData } from "../useTransactionSimulatedData"
import { useTransactionSimulation } from "../useTransactionSimulation"
import { AccountNetworkInfo } from "./AccountNetworkInfo"
import { BalanceChangeOverview } from "./BalanceChangeOverview"
import { ConfirmScreen } from "./ConfirmScreen"
import { DappHeader } from "./DappHeader"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"

const VERIFIED_DAPP_ENABLED = process.env.FEATURE_VERIFIED_DAPPS === "true"

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
  declareOrDeployType?: "declare" | "deploy"
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactions,
  selectedAccount,
  actionHash,
  onSubmit,
  declareOrDeployType,
  ...props
}) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [txDetails, setTxDetails] = useState(false)

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

  const transactionsArray: Call[] = useMemo(
    () => (isArray(transactions) ? transactions : [transactions]),
    [transactions],
  )

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

  // Show balance change if there is a transaction simulation and there are approvals or transfers
  const hasBalanceChange =
    transactionSimulation && (txnHasTransfers || txnHasApprovals)

  // Show actions if there is no balance change or if there is a balance change and the user has expanded the details
  const showTransactionActions =
    (!hasBalanceChange || (txDetails && hasBalanceChange)) && !isUdcAction

  const verifiedDapp =
    VERIFIED_DAPP_ENABLED && isMainnet && transactionReview?.targetedDapp

  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4 upgradeType="account" {...props} />
  }

  if (isSimulationLoading) {
    return <LoadingScreen />
  }

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
      {...props}
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

      {hasBalanceChange && (
        <BalanceChangeOverview
          transactionSimulation={transactionSimulation}
          transactionReview={transactionReview}
        />
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

      {hasBalanceChange && (
        <Center>
          <P4
            fontWeight="bold"
            color="neutrals.400"
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => setTxDetails(!txDetails)}
          >
            {txDetails ? "Hide" : "View more"} details
          </P4>
        </Center>
      )}
    </ConfirmScreen>
  )
}
