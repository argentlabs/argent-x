import { FC } from "react"
import { Call } from "starknet"

import { isErc20ApproveCall } from "../../../../shared/call/erc20ApproveCall"
import { isErc20TransferCall } from "../../../../shared/call/erc20TransferCall"
import { Token } from "../../../../shared/token/type"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
import { ERC20ApproveTransactionDetails } from "./ERC20ApproveTransactionDetails"
import { ERC20TransferTransactionDetails } from "./ERC20TransferTransactionDetails"

export interface TransactionDetailsProps {
  transaction: Call
  tokensByNetwork: Token[]
  networkId: string
}

/** Renders a single transaction */

export const TransactionDetails: FC<TransactionDetailsProps> = ({
  transaction,
  tokensByNetwork,
  networkId,
}) => {
  if (isErc20TransferCall(transaction)) {
    return (
      <ERC20TransferTransactionDetails
        transaction={transaction}
        tokensByNetwork={tokensByNetwork}
        networkId={networkId}
      />
    )
  } else if (isErc20ApproveCall(transaction)) {
    return (
      <ERC20ApproveTransactionDetails
        transaction={transaction}
        tokensByNetwork={tokensByNetwork}
        networkId={networkId}
      />
    )
  }
  return (
    <DefaultTransactionDetails
      transaction={transaction}
      tokensByNetwork={tokensByNetwork}
      networkId={networkId}
    />
  )
}
