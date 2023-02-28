import {
  Call,
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"

export interface TransactionsFeeEstimationProps {
  transactions: Call | Call[]
  defaultMaxFee?: bigint
  onChange?: (fee: bigint) => void
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
  needsDeploy?: boolean
  payload: DeclareContractPayload
}

export type DeployContractFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
> & {
  needsDeploy?: boolean
  payload: UniversalDeployerContractPayload
}
