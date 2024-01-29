import { Call } from "starknet"
import { ApiTransactionBulkSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { Address } from "@argent/shared"
export interface TransactionsFeeEstimationProps {
  feeTokenAddress: Address
  transactions: Call | Call[]
  defaultMaxFee?: bigint
  onChange?: (fee: bigint) => void
  onErrorChange?: (error: boolean) => void
  onFeeErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  actionHash: string
  userClickedAddFunds?: boolean
  transactionSimulation?: ApiTransactionBulkSimulationResponse
  transactionSimulationFee?: EstimatedFees
  transactionSimulationLoading: boolean
  transactionSimulationFeeError?: Error
  needsDeploy?: boolean
}
