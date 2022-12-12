import { FC } from "react"

import { Estimation } from "./DeclareDeploy/Estimation"
import { useEstimationAccountFees } from "./DeclareDeploy/useEstimationAccountFees"
import { DeployAccountFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"

export const AccountDeploymentFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
  const { account, feeToken, feeTokenBalance } = useEstimationAccountFees(
    accountAddress,
    networkId,
  )

  const { fee, error } = useMaxAccountDeploymentFeeEstimation(
    account,
    actionHash,
  )

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
