import { P4 } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { isArray, isEmpty } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { getDisplayWarnAndReasonForTransactionReview } from "../../../shared/transactionReview.service"
import { WarningIcon } from "../../components/Icons/WarningIcon"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { ConfirmScreen } from "./ConfirmScreen"
import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { CombinedFeeEstimation } from "./feeEstimation/CombinedFeeEstimation"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import { BalanceChangeOverview } from "./transaction/BalanceChangeOverview"
import { DappHeader } from "./transaction/DappHeader"
import { TransactionActions } from "./transaction/TransactionActions"
import { TransactionBanner } from "./transaction/TransactionBanner"
import { useTransactionReview } from "./transaction/useTransactionReview"
import { useAggregatedSimData } from "./transaction/useTransactionSimulatedData"
import { useTransactionSimulation } from "./transaction/useTransactionSimulation"
import { VerifiedDappBanner } from "./transaction/VerifiedDappBanner"

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactions,
  selectedAccount,
  actionHash,
  onSubmit,
  ...props
}) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [txDetails, setTxDetails] = useState(false)

  const { data: transactionReview } = useTransactionReview({
    account: selectedAccount,
    transactions,
    actionHash,
  })

  const { data: transactionSimulation } = useTransactionSimulation({
    account: selectedAccount,
    transactions,
    actionHash,
  })

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

  // Show balance change if there is a transaction simulation and there are approvals or transfers
  const hasBalanceChange = transactionSimulation && txnHasTransfers

  // Show actions if there is no balance change or if there is a balance change and the user has expanded the details
  const showTransactionActions =
    !hasBalanceChange || (txDetails && hasBalanceChange)

  const verifiedDapp = transactionReview?.targetedDapp

  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4 upgradeType="account" {...props} />
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
      />

      {warn ? (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      ) : verifiedDapp ? (
        <VerifiedDappBanner dapp={verifiedDapp} />
      ) : (
        <></>
      )}

      {hasBalanceChange && (
        <BalanceChangeOverview transactionSimulation={transactionSimulation} />
      )}
      {showTransactionActions && (
        <TransactionActions transactions={transactionsArray} />
      )}

      <AccountNetworkInfo account={selectedAccount} />

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
