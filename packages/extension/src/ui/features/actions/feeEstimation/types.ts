import type { TokenWithBalance, TransactionAction } from "@argent/x-shared"
import type { AccountId } from "../../../../shared/wallet.model"
import type { EstimatedFees } from "@argent/x-shared/simulation"

export interface TransactionsFeeEstimationProps {
  feeToken?: TokenWithBalance
  transactionAction: TransactionAction
  defaultMaxFee?: bigint
  onChange?: (fee: bigint) => void
  onErrorChange?: (error: boolean) => void
  onFeeErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  accountId: AccountId
  actionHash: string
  userClickedAddFunds?: boolean
  transactionSimulationFee?: EstimatedFees
  transactionSimulationLoading: boolean
  needsDeploy?: boolean
  allowFeeTokenSelection?: boolean
  onFeeTokenPickerOpen?: () => void
  actionErrorApproving?: string
}
