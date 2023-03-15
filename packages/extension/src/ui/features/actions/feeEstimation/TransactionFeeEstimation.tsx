import { FC } from "react"

import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"

export const TransactionFeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  return (
    <FeeEstimation
      fee={fee}
      accountAddress={accountAddress}
      networkId={networkId}
      feeError={error}
      onErrorChange={onErrorChange}
    />
  )
}
