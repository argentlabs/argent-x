import { isArray } from "lodash-es"
import { FC, useCallback, useState } from "react"
import { Call } from "starknet"
import styled from "styled-components"

import {
  Erc20TransferCall,
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../shared/call"
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
import { formatTruncatedAddress } from "../../services/addresses"
import { TokenIcon } from "../accountTokens/TokenIcon"
import { formatTokenBalance } from "../accountTokens/tokens.service"
import { selectTokensByNetwork, useTokens } from "../accountTokens/tokens.state"

const LeftPaddedField = styled.div`
  margin-left: 8px;
`

const DisclosureIconContainer = styled.div<{ expanded: boolean }>`
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

export interface TransactionItemProps {
  transaction: Call
}

export interface Erc20TransferCallTransactionItemProps {
  transaction: Erc20TransferCall
}

/** Renders a single transaction */

export const TransactionItem: FC<TransactionItemProps> = ({ transaction }) => {
  if (isErc20TransferCall(transaction)) {
    return (
      <ERC20TransferTransactionDetails
        transaction={transaction as Erc20TransferCall}
      />
    )
  }
  return <DefaultTransactionDetails transaction={transaction} />
}

/** Renders an ERC20 transfer transaction */

export const ERC20TransferTransactionDetails: FC<
  Erc20TransferCallTransactionItemProps
> = ({ transaction }) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokens(selectTokensByNetwork(switcherNetworkId))
  if (!isErc20TransferCall(transaction)) {
    return <DefaultTransactionDetails transaction={transaction} />
  }
  const { contractAddress, recipientAddress, amount } =
    parseErc20TransferCall(transaction)
  const token = tokensByNetwork.find(
    ({ address }) => address.toLowerCase() === contractAddress.toLowerCase(),
  )
  const displaySendAddress = formatTruncatedAddress(recipientAddress)
  const displayAmount = formatTokenBalance(amount, token?.decimals?.toNumber())
  return (
    <FieldGroup>
      <Field>
        <FieldKey>Send</FieldKey>
        <FieldValue>
          {token && <TokenIcon url={token.image} name={token.name} small />}
          <LeftPaddedField>
            {displayAmount} {token?.symbol || "Unknown token"}
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

/** Renders a non-transfer transaction */

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
          <DisclosureIconContainer expanded={expanded}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </DisclosureIconContainer>
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
  )
}
