import { BigNumber } from "ethers"
import { Call } from "starknet"

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
