import { FC } from "react"

import { Estimation } from "./DeclareDeploy/Estimation"
import { useEstimationAccountFees } from "./DeclareDeploy/useEstimationAccountFees"
import { DeclareContractFeeEstimationProps } from "./types"
import { useMaxDeclareContractFeeEstimation } from "./utils"

export const DeclareContractFeeEstimation: FC<
  DeclareContractFeeEstimationProps
> = ({ accountAddress, networkId, payload, actionHash, onErrorChange }) => {
  const { feeToken, feeTokenBalance } = useEstimationAccountFees(
    accountAddress,
    networkId,
  )

  const { fee, error } = useMaxDeclareContractFeeEstimation(
    {
      address: accountAddress,
      networkId,
      ...payload,
    },
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
