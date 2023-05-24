import { BigNumber } from "ethers"
import {
  Call,
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"

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

export interface FeeEstimationProps {
  fee?: EstimateFeeResponse
  accountAddress: string
  networkId: string
  onErrorChange?: (error: boolean) => void
  feeError?: any
}
