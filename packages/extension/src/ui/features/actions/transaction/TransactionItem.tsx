import { FC } from "react"
import { Call } from "starknet"

import { Erc20TransferCall, isErc20TransferCall } from "../../../../shared/call"
import { TokenDetails } from "../../accountTokens/tokens.state"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
import { ERC20TransferTransactionDetails } from "./ERC20TransferTransactionDetails"

export interface TransactionItemProps {
  transaction: Call
  tokensByNetwork: TokenDetails[]
}
/** Renders a single transaction */

export const TransactionItem: FC<TransactionItemProps> = ({
  transaction,
  tokensByNetwork,
}) => {
  if (isErc20TransferCall(transaction)) {
    return (
      <ERC20TransferTransactionDetails
        transaction={transaction as Erc20TransferCall}
        tokensByNetwork={tokensByNetwork}
      />
    )
  }
  return (
    <DefaultTransactionDetails
      transaction={transaction}
      tokensByNetwork={tokensByNetwork}
    />
  )
}
