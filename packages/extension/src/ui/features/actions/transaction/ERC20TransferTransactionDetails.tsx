import { FC } from "react"

import {
  Erc20TransferCall,
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call/erc20TransferCall"
import { Token } from "../../../../shared/token/type"
import { FieldGroup } from "../../../components/Fields"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
import { AccountAddressField } from "./fields/AccountAddressField"
import { TokenField } from "./fields/TokenField"

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

  return (
    <FieldGroup>
      <TokenField
        label="Send"
        amount={amount}
        contractAddress={contractAddress}
        tokensByNetwork={tokensByNetwork}
      />
      <AccountAddressField
        title="To"
        accountAddress={recipientAddress}
        networkId={networkId}
      />
    </FieldGroup>
  )
}
