import type { TokenWithBalance } from "@argent/x-shared"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import type { ParsedFeeError } from "./feeError"

export interface FeeEstimationProps {
  amountCurrencyValue?: string
  fee?: EstimatedFeesV2
  feeToken: TokenWithBalance
  parsedFeeEstimationError?: ParsedFeeError
  showError: boolean
  showEstimateError: boolean
  showInsufficientFeeError: boolean
  userClickedAddFunds?: boolean
  needsDeploy?: boolean
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
  isSubsidised?: boolean
}
