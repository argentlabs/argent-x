import { FC } from "react"

import {
  Erc20TransferCall,
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call"
import { Token } from "../../../../shared/token/type"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../../components/Fields"
import { formatTruncatedAddress } from "../../../services/addresses"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
import { AccountField } from "./fields/AccountField"
import { TokenField } from "./fields/TokenField"
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

  const displaySendAddress = formatTruncatedAddress(recipientAddress)
  const knownAccount = getKnownWalletAddress({
    address: recipientAddress,
    networkId,
  })

  return (
    <FieldGroup>
      <TokenField
        label="Send"
        amount={amount}
        contractAddress={contractAddress}
        tokensByNetwork={tokensByNetwork}
      />
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
