import { isArray } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"
import styled from "styled-components"

import { isErc20TransferCall } from "../../../shared/call"
import { useAppState } from "../../app.state"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { useIsPreauthorized } from "./connectDapp/useIsPreauthorized"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsList } from "./transaction/TransactionsList"
import { useTransactionReview } from "./transaction/useTransactionReview"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
}

const LeftPaddedField = styled.div`
  margin-left: 8px;
`

export const titleForTransactions = (transactions: Call | Call[] = []) => {
  const transactionsArray: Call[] = isArray(transactions)
    ? transactions
    : [transactions]
  const hasErc20Transfer = transactionsArray.some(isErc20TransferCall)
  return hasErc20Transfer ? "Review send" : "Check transactions"
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
  const { accountNames } = useAccountMetadata()
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const isPreauthorized = useIsPreauthorized()

  const { data: transactionReview } = useTransactionReview({
    account: selectedAccount,
    transactions,
    actionHash,
  })

  const title = useMemo(() => {
    return titleForTransactions(transactions)
  }, [transactions])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  /** will be undefined while initialising */
  if (isPreauthorized === false) {
    /** FIXME: somehow the user has created a transaction with a non-connected account */
    /** they should be prompted to pick an account here */
  }

  const accountName = getAccountName(selectedAccount, accountNames)
  const confirmButtonVariant =
    transactionReview?.assessment === "warn" ? "warn" : undefined

  return (
    <ConfirmScreen
      title={title}
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      confirmButtonVariant={confirmButtonVariant}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        onSubmit(transactions)
      }}
      showHeader={false}
      footer={
        <FeeEstimation
          onErrorChange={setDisableConfirm}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          transactions={transactions}
          actionHash={actionHash}
        />
      }
      {...props}
    >
      <TransactionsList
        networkId={switcherNetworkId}
        transactions={transactions}
        transactionReview={transactionReview}
        tokensByNetwork={tokensByNetwork}
      />
      <FieldGroup>
        <Field>
          <FieldKey>From</FieldKey>
          <FieldValue>
            <ProfilePicture
              src={getAccountImageUrl(accountName, selectedAccount)}
              small
              disabled
            />
            <LeftPaddedField>{accountName}</LeftPaddedField>
          </FieldValue>
        </Field>
        <Field>
          <FieldKey>Network</FieldKey>
          <FieldValue>{selectedAccount.network.name}</FieldValue>
        </Field>
      </FieldGroup>
    </ConfirmScreen>
  )
}
