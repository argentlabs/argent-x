import { FC } from "react"

import { FeeEstimationContainer } from "./FeeEstimation"
import { DeployAccountFeeEstimationProps } from "./types"

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
  return (
    <FeeEstimationContainer
      accountAddress={accountAddress}
      networkId={networkId}
      onErrorChange={onErrorChange}
      actionHash={actionHash}
      transactions={[]}
    />
  )
}
