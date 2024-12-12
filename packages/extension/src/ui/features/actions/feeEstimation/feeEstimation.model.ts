import type { TokenWithBalance } from "@argent/x-shared"
import type { EstimatedFees } from "@argent/x-shared/simulation"
import type { ParsedFeeError } from "./feeError"

export interface FeeEstimationProps {
  amountCurrencyValue?: string
  fee?: EstimatedFees
  feeToken: TokenWithBalance
  parsedFeeEstimationError?: ParsedFeeError
  showError: boolean
  showEstimateError: boolean
  showFeeError: boolean
  suggestedMaxFeeCurrencyValue?: string
  userClickedAddFunds?: boolean
  needsDeploy?: boolean
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
}
