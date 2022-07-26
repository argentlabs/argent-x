import { FC } from "react"

import {
  Erc20TransferCall,
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call"
import { prettifyTokenAmount } from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../components/Fields"
import { formatTruncatedAddress } from "../../../services/addresses"
import { TokenIcon } from "../../accountTokens/TokenIcon"
import { AccountField } from "./AccountField"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
import { getKnownWalletAddress } from "./getKnownWalletAddress"

/** Renders an ERC20 transfer transaction */

export interface Erc20TransferCallTransactionItemProps {
  transaction: Erc20TransferCall
  tokensByNetwork: Token[]
  networkId: string
}

export const ERC20TransferTransactionDetails: FC<
  Erc20TransferCallTransactionItemProps
> = ({ transaction, tokensByNetwork, networkId }) => {
  if (!isErc20TransferCall(transaction)) {
    return (
      <DefaultTransactionDetails
        transaction={transaction}
        tokensByNetwork={tokensByNetwork}
        networkId={networkId}
      />
    )
  }
  const { contractAddress, recipientAddress, amount } =
    parseErc20TransferCall(transaction)
  const token = tokensByNetwork.find(
    ({ address }) => address.toLowerCase() === contractAddress.toLowerCase(),
  )
  const displaySendAddress = formatTruncatedAddress(recipientAddress)
  const knownAccount = getKnownWalletAddress({
    address: recipientAddress,
    networkId,
  })
  const displayAmount = token
    ? prettifyTokenAmount({
        amount,
        decimals: token?.decimals,
        symbol: token?.symbol || "Unknown token",
      })
    : amount.toString()

  return (
    <FieldGroup>
      <Field>
        <FieldKey>Send</FieldKey>
        <FieldValue>
          {token && <TokenIcon url={token.image} name={token.name} small />}
          <LeftPaddedField>{displayAmount}</LeftPaddedField>
        </FieldValue>
      </Field>
      <Field>
        <FieldKey>To</FieldKey>
        {knownAccount ? (
          <AccountField account={knownAccount} />
        ) : (
          <FieldValue>{displaySendAddress}</FieldValue>
        )}
      </Field>
    </FieldGroup>
  )
}
