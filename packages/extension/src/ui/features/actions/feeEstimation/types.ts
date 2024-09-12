import { ApiTransactionBulkSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { EstimatedFees } from "@argent/x-shared/simulation"
import { TokenWithBalance, TransactionAction } from "@argent/x-shared"

export interface TransactionsFeeEstimationProps {
  feeToken?: TokenWithBalance
  transactionAction: TransactionAction
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
  allowFeeTokenSelection?: boolean
  onFeeTokenPickerOpen?: () => void
  actionErrorApproving?: string
}
