import { FC, useMemo } from "react"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import { FeeEstimation } from "./FeeEstimation"
import { DeployAccountFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
  const { fee, error } = useMaxAccountDeploymentFeeEstimation(
    { address: accountAddress, networkId },
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
    <FeeEstimation
      fee={deployAccountFeeToEstimateFeeResponse}
      feeError={error}
      accountAddress={accountAddress}
      networkId={networkId}
      onErrorChange={onErrorChange}
    />
  )
}
