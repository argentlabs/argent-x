import { isArray } from "lodash-es"
import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { formatTokenBalance } from "../../features/accountTokens/tokens.service"
import { routes } from "../../routes"
import { formatTruncatedAddress } from "../../services/addresses"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { TokenIcon } from "../accountTokens/TokenIcon"
import { selectTokensByNetwork, useTokens } from "../accountTokens/tokens.state"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { FeeEstimation } from "./FeeEstimation"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
}

const Pre = styled.pre`
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
  background: #161616;
`

const LeftPaddedField = styled.div`
  margin-left: 8px;
`

export interface TransactionDetailProps {
  transaction: Call
}

/** Renders a single transaction */

export const TransactionDetail: FC<TransactionDetailProps> = ({
  transaction,
}) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokens(selectTokensByNetwork(switcherNetworkId))
  const token = tokensByNetwork.find(
    ({ address }) => address === transaction.contractAddress,
  )
  if (transaction.entrypoint === "transfer") {
    /** recipient address is first entry in calldata array */
    const displaySendAddress = transaction.calldata
      ? formatTruncatedAddress(transaction.calldata[0])
      : "–"
    /** amount is second entry in calldata array */
    const displayAmount = transaction.calldata
      ? formatTokenBalance(transaction.calldata[1])
      : "–"
    return (
      <FieldGroup>
        <Field>
          <FieldKey>Send</FieldKey>
          <FieldValue>
            {token && <TokenIcon url={token.image} name={token.name} small />}
            <LeftPaddedField>
              {displayAmount} {token?.symbol}
            </LeftPaddedField>
          </FieldValue>
        </Field>
        <Field>
          <FieldKey>To</FieldKey>
          <FieldValue>{displaySendAddress}</FieldValue>
        </Field>
      </FieldGroup>
    )
  }
  return (
    <FieldGroup>
      <Field>
        <FieldKey>Contract</FieldKey>
        <FieldValue>{transaction.contractAddress}</FieldValue>
      </Field>
      <Field>
        <FieldKey>Action</FieldKey>
        <FieldValue>{transaction.entrypoint}</FieldValue>
      </Field>
    </FieldGroup>
  )
}

export interface TransactionDetailsProps {
  transactions: Call | Call[]
}

/** Renders one or more transactions */

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  transactions,
}) => {
  const transactionsAsArray: Call[] = isArray(transactions)
    ? transactions
    : [transactions]
  return (
    <>
      {transactionsAsArray.map((transaction, index) => (
        <TransactionDetail key={index} transaction={transaction} />
      ))}
    </>
  )
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactions,
  selectedAccount,
  actionHash,
  onSubmit,
  ...props
}) => {
  const [disableConfirm, setDisableConfirm] = useState(true)
  const { accountNames } = useAccountMetadata()

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  const accountName = getAccountName(selectedAccount, accountNames)

  return (
    <ConfirmScreen
      title="Send transaction"
      confirmButtonText="Sign"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        onSubmit(transactions)
      }}
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
      <TransactionDetails transactions={transactions} />
      <Pre>{JSON.stringify(transactions, null, 2)}</Pre>
      <FieldGroup>
        <Field>
          <FieldKey>From</FieldKey>
          <FieldValue>
            <ProfilePicture
              src={getAccountImageUrl(accountName, selectedAccount.address)}
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
