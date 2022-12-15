import { FC } from "react"

import { Estimation } from "./DeclareDeploy/Estimation"
import { useEstimationAccountFees } from "./DeclareDeploy/useEstimationAccountFees"
import { DeployContractFeeEstimationProps } from "./types"
import { useMaxDeployContractFeeEstimation } from "./utils"

export const DeployContractFeeEstimation: FC<
  DeployContractFeeEstimationProps
> = ({ accountAddress, networkId, payload, actionHash, onErrorChange }) => {
  const { feeToken, feeTokenBalance } = useEstimationAccountFees(
    accountAddress,
    networkId,
  )
  const { fee, error } = useMaxDeployContractFeeEstimation(payload, actionHash)
  return (
    <Estimation
      fee={fee}
      feeToken={feeToken}
      feeTokenBalance={feeTokenBalance}
      error={error}
      onErrorChange={onErrorChange}
    />
  )
}
