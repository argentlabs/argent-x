import { isArray } from "lodash-es"
import { FC, useCallback, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import {
  ArrowForwardIosIcon,
  ContentCopyIcon,
} from "../../components/Icons/MuiIcons"
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

const DisclosureIcon = styled(ArrowForwardIosIcon)<{ expanded: boolean }>`
  transition: transform 0.1s;
  transform: rotate(${({ expanded }) => (expanded ? "90deg" : "0deg")});
`

const TransactionDetailsField = styled(Field)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionDetailKey = styled(FieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`

const TransactionJson = styled.pre`
  font-weight: normal;
  font-size: 12px;
  line-height: 12px;
  color: #8f8e8c;
`

export interface TransactionItemProps {
  transaction: Call
}

export const TransferTransactionDetails: FC<TransactionItemProps> = ({
  transaction,
}) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokens(selectTokensByNetwork(switcherNetworkId))
  const token = tokensByNetwork.find(
    ({ address }) => address === transaction.contractAddress,
  )
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

export const DefaultTransactionDetails: FC<TransactionItemProps> = ({
  transaction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])
  const displayContractAddress = formatTruncatedAddress(
    transaction.contractAddress,
  )
  const displayTransaction = JSON.stringify(transaction, null, 2)
  return (
    <>
      <FieldGroup>
        <Field>
          <FieldKey>Contract</FieldKey>
          <FieldValue>{displayContractAddress}</FieldValue>
        </Field>
        <Field>
          <FieldKey>Action</FieldKey>
          <FieldValue>{transaction.entrypoint}</FieldValue>
        </Field>
        <Field clickable onClick={toggleExpanded}>
          <FieldKey>View details</FieldKey>
          <FieldValue>
            <DisclosureIcon expanded={expanded} fontSize="inherit" />
          </FieldValue>
        </Field>
        {expanded && (
          <TransactionDetailsField>
            <TransactionDetailKey>
              <div>Transaction details</div>
              <CopyTooltip message="Copied" copyValue={displayTransaction}>
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </CopyTooltip>
            </TransactionDetailKey>
            <FieldValue>
              <TransactionJson>{displayTransaction}</TransactionJson>
            </FieldValue>
          </TransactionDetailsField>
        )}
      </FieldGroup>
    </>
  )
}

/** Renders a single transaction */

export const TransactionItem: FC<TransactionItemProps> = ({ transaction }) => {
  if (transaction.entrypoint === "transfer") {
    return <TransferTransactionDetails transaction={transaction} />
  }
  return <DefaultTransactionDetails transaction={transaction} />
}
export interface TransactionsListProps {
  transactions: Call | Call[]
}

/** Renders one or more transactions */

export const TransactionsList: FC<TransactionsListProps> = ({
  transactions,
}) => {
  const transactionsArray: Call[] = isArray(transactions)
    ? transactions
    : [transactions]
  return (
    <>
      {transactionsArray.map((transaction, index) => (
        <TransactionItem key={index} transaction={transaction} />
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
      <TransactionsList transactions={transactions} />
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
