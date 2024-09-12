import {
  estimatedFeesToMaxFeeTotal,
  estimatedFeeToMaxFeeTotal,
  TokenWithBalance,
} from "@argent/x-shared"
import {
  EstimatedFee,
  EstimatedFees,
  estimatedFeeSchema,
  estimatedFeesSchema,
} from "@argent/x-shared/simulation"

export const hasFeeTokenEnoughBalance = (
  feeToken: TokenWithBalance,
  estimatedFee: EstimatedFees | EstimatedFee | bigint,
) => {
  let totalFee

  if (estimatedFeesSchema.safeParse(estimatedFee).success)
    totalFee = estimatedFeesToMaxFeeTotal(estimatedFee as EstimatedFees)
  else if (estimatedFeeSchema.safeParse(estimatedFee).success)
    totalFee = estimatedFeeToMaxFeeTotal(estimatedFee as EstimatedFee)
  else totalFee = estimatedFee as bigint

  return feeToken.balance >= totalFee
}
