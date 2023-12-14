import { Token } from "../../../../shared/token/__new/types/token.model"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { ParsedFeeError } from "./feeError"

export interface FeeEstimationProps {
  amountCurrencyValue?: string
  fee?: EstimatedFees
  feeToken: Token
  feeTokenBalance?: bigint
  parsedFeeEstimationError?: ParsedFeeError
  showError: boolean
  showEstimateError: boolean
  showFeeError: boolean
  suggestedMaxFeeCurrencyValue?: string
  userClickedAddFunds?: boolean
  needsDeploy?: boolean
}
