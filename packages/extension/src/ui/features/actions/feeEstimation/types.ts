import { BigNumber } from "ethers"
import { Call, UniversalDeployerContractPayload } from "starknet"

export interface TransactionsFeeEstimationProps {
  transactions: Call | Call[]
  defaultMaxFee?: BigNumber
  onChange?: (fee: BigNumber) => void
  onErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  actionHash: string
}

export type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
>

export type DeclareContractFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
> & {
  classHash: string
  contract: any
}

export type DeployContractFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
> &
  UniversalDeployerContractPayload
