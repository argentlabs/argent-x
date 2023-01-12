import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./DeprecatedConfirmScreen"
import { CombinedFeeEstimation } from "./feeEstimation/CombinedFeeEstimation"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import { DappHeader } from "./transaction/DappHeader"
import { TransactionsList } from "./transaction/TransactionsList"
import { useTransactionReview } from "./transaction/useTransactionReview"

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
  const { id: networkId } = useCurrentNetwork()
  const tokensByNetwork = useTokensInNetwork(networkId)

  const { data: transactionReview } = useTransactionReview({
    account: selectedAccount,
    transactions,
    actionHash,
  })
  console.log(
    "🚀 ~ file: ApproveTransactionScreen.tsx:74 ~ transactionReview",
    transactionReview,
  )

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

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4 upgradeType="account" {...props} />
  }

  return (
    <DeprecatedConfirmScreen
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
      <DappHeader
        transactions={transactions}
        transactionReview={transactionReview}
      />

      <TransactionsList
        networkId={networkId}
        transactions={transactions}
        transactionReview={transactionReview}
        tokensByNetwork={tokensByNetwork}
      />
      <AccountNetworkInfo account={selectedAccount} />
    </DeprecatedConfirmScreen>
  )
}
