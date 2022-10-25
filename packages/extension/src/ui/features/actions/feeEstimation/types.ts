import { BigNumber } from "ethers"
import { Call } from "starknet"

import { AllowArray } from "../../../../shared/storage/types"

export interface FeeEstimationProps {
  transactions: Call | Call[]
  defaultMaxFee?: BigNumber
  onChange?: (fee: BigNumber) => void
  onErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  actionHash: string
}

export type DeployAccountFeeEstimationProps = Omit<
  FeeEstimationProps,
  "transactions"
> & {
  transactions?: AllowArray<Call>
}
