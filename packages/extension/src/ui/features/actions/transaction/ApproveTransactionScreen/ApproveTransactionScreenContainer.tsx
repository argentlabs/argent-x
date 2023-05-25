import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { routes } from "../../../../routes"
import { usePageTracking } from "../../../../services/analytics"
import { Account } from "../../../accounts/Account"
import { useAccountTransactions } from "../../../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../../../accounts/upgrade.service"
import { UpgradeScreenV4Container } from "../../../accounts/UpgradeScreenV4Container"
import { useFeeTokenBalance } from "../../../accountTokens/tokens.service"
import { useIsSignerInMultisig } from "../../../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../../../multisig/multisig.state"
import { useMultisigPendingTransactionsByAccount } from "../../../multisig/multisigTransactions.state"
import { RemovedMultisigWarningScreen } from "../../../multisig/RemovedMultisigWarningScreen"
import { useIsMainnet } from "../../../networks/hooks/useIsMainnet"
import { CombinedFeeEstimationContainer } from "../../feeEstimation/CombinedFeeEstimationContainer"
import { FeeEstimationContainer } from "../../feeEstimation/FeeEstimationContainer"
import { ApproveScreenType } from "../types"
import { useTransactionReview } from "../useTransactionReview"
import { useAggregatedSimData } from "../useTransactionSimulatedData"
import { useTransactionSimulation } from "../useTransactionSimulation"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConfirmPageProps } from "./ConfirmScreen"

const VERIFIED_DAPP_ENABLED = process.env.FEATURE_VERIFIED_DAPPS === "true"

export interface ApproveTransactionScreenContainerProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: (transactions: Call | Call[]) => void
  approveScreenType: ApproveScreenType
  declareOrDeployType?: "declare" | "deploy"
  selectedAccount?: Account
  transactions: Call | Call[]
}

export const ApproveTransactionScreenContainer: FC<
  ApproveTransactionScreenContainerProps
> = ({ actionHash, selectedAccount, transactions, onReject, ...rest }) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)
  const isMainnet = useIsMainnet()
  const multisig = useMultisig(selectedAccount)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)

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

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(selectedAccount)

  const hasPendingMultisigTransactions = pendingMultisigTransactions.length > 0

  const verifiedDapp =
    (VERIFIED_DAPP_ENABLED && isMainnet && transactionReview?.targetedDapp) ||
    undefined

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4Container upgradeType="account" {...rest} />
  }

  return (
    <ApproveTransactionScreen
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
      hasPendingMultisigTransactions={hasPendingMultisigTransactions}
      multisig={multisig}
      onReject={onReject}
      footer={
        selectedAccount.needsDeploy ? (
          <CombinedFeeEstimationContainer
            onErrorChange={setDisableConfirm}
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
            transactions={transactions}
            actionHash={actionHash}
          />
        ) : (
          <FeeEstimationContainer
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
