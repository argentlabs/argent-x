import { isArray } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { isErc20TransferCall } from "../../../shared/call"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewHasSwap,
} from "../../../shared/transactionReview.service"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { CombinedFeeEstimation } from "./feeEstimation/CombinedFeeEstimation"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"
import { TransactionsList } from "./transaction/TransactionsList"
import { useTransactionReview } from "./transaction/useTransactionReview"

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
}

export const titleForTransactionsAndReview = (
  transactions: Call | Call[] = [],
  transactionReview: ApiTransactionReviewResponse | undefined,
) => {
  const transactionsArray: Call[] = isArray(transactions)
    ? transactions
    : [transactions]
  const hasErc20Transfer = transactionsArray.some(isErc20TransferCall)
  const hasSwap = getTransactionReviewHasSwap(transactionReview)
  return hasErc20Transfer
    ? "Review send"
    : hasSwap
    ? "Review trade"
    : transactionsArray.length === 1
    ? "Review transaction"
    : "Review transactions"
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

  const title = useMemo(() => {
    return titleForTransactionsAndReview(transactions, transactionReview)
  }, [transactionReview, transactions])

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

  const confirmButtonVariant =
    transactionReview?.assessment === "warn" ? "warn-high" : undefined

  return (
    <ConfirmScreen
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      confirmButtonVariant={confirmButtonVariant}
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
      <TransactionsList
        networkId={networkId}
        transactions={transactions}
        transactionReview={transactionReview}
        tokensByNetwork={tokensByNetwork}
      />
      <FieldGroup>
        <AccountAddressField
          title="From"
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.network.id}
        />
        <Field>
          <FieldKey>Network</FieldKey>
          <FieldValue>{selectedAccount.network.name}</FieldValue>
        </Field>
      </FieldGroup>
    </ConfirmScreen>
  )
}
