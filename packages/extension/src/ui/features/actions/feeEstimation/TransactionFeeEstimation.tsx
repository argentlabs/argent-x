import { FC } from "react"

import { FeeEstimationContainer } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"

export const TransactionFeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  return (
    <FeeEstimationContainer
      accountAddress={accountAddress}
      networkId={networkId}
      onErrorChange={onErrorChange}
      transactions={transactions}
      actionHash={actionHash}
    />
  )
}
