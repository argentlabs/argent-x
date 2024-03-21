import { TokenWithBalance } from "@argent/x-shared"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { ParsedFeeError } from "./feeError"

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
