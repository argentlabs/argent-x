import { TokenWithBalance } from "@argent/shared"

export interface EstimateFeeResponse {
  fee: bigint
  maxFee: bigint
}

export type EstimateDeploymentFeeResponse =
  | {
      needsDeploy: false
    }
  | ({
      needsDeploy: true
    } & EstimateFeeResponse)

export interface TransactionsFeeEstimationProps {
  onErrorChange?: (error: boolean) => void
  deploymentFees?: EstimateDeploymentFeeResponse
  executionFees?: EstimateFeeResponse
  feeTokenWithBalance?: TokenWithBalance
  enoughBalance: boolean
  error: string
}
