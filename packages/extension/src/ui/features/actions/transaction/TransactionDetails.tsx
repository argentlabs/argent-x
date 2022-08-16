import { FC } from "react"
import { Call } from "starknet"

import { isErc20TransferCall } from "../../../../shared/call"
import { Token } from "../../../../shared/token/type"
import { DefaultTransactionDetails } from "./DefaultTransactionDetails"
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
  }
  return (
    <DefaultTransactionDetails
      transaction={transaction}
      tokensByNetwork={tokensByNetwork}
      networkId={networkId}
    />
  )
}
