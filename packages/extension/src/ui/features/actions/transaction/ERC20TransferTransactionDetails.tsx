import { FC } from "react"
import styled from "styled-components"

import {
  Erc20TransferCall,
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../../components/Fields"
import { formatTruncatedAddress } from "../../../services/addresses"
import { TokenIcon } from "../../accountTokens/TokenIcon"
import { formatTokenBalance } from "../../accountTokens/tokens.service"
import { TokenDetails } from "../../accountTokens/tokens.state"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"

const LeftPaddedField = styled.div`
  margin-left: 8px;
  text-align: right;
`

/** Renders an ERC20 transfer transaction */

export interface Erc20TransferCallTransactionItemProps {
  transaction: Erc20TransferCall
  tokensByNetwork: TokenDetails[]
}

export const ERC20TransferTransactionDetails: FC<
  Erc20TransferCallTransactionItemProps
> = ({ transaction, tokensByNetwork }) => {
  if (!isErc20TransferCall(transaction)) {
    return (
      <DefaultTransactionDetails
        transaction={transaction}
        tokensByNetwork={tokensByNetwork}
      />
    )
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
