import { FC, useMemo } from "react"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import { Estimation } from "./DeclareDeploy/Estimation"
import { useEstimationAccountFees } from "./DeclareDeploy/useEstimationAccountFees"
import { DeployAccountFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"

/**
 *
 * @deprecated Please use the new Component `DeployAccountFeeEstimation`
 */
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

  const deployAccountFeeToEstimateFeeResponse: EstimateFeeResponse | undefined =
    useMemo(() => {
      if (!fee) {
        return undefined
      }

      return {
        suggestedMaxFee: fee.maxADFee,
        amount: fee.amount,
      }
    }, [fee])

  return (
    <Estimation
      fee={deployAccountFeeToEstimateFeeResponse}
      feeToken={feeToken}
      feeTokenBalance={feeTokenBalance}
      error={error}
      onErrorChange={onErrorChange}
    />
  )
}
