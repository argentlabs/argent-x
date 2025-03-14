import type { TokenWithBalance } from "@argent/x-shared"
import {
  estimatedFeesToMaxFeeTotalV2,
  estimatedFeeToMaxFeeTotal,
} from "@argent/x-shared"
import type {
  EstimatedFeesV2,
  EstimatedFeeV2,
  NativeEstimatedFee,
} from "@argent/x-shared/simulation"
import {
  estimatedFeesV2Schema,
  nativeEstimatedFeeSchema,
} from "@argent/x-shared/simulation"

export const hasFeeTokenEnoughBalance = (
  feeToken: TokenWithBalance,
  fees: EstimatedFeesV2 | EstimatedFeeV2 | bigint,
): boolean => {
  let totalFee: bigint

  // Handle different fee types and calculate total fee accordingly
  if (estimatedFeesV2Schema.safeParse(fees).success) {
    // For paymaster fees
    totalFee = estimatedFeesToMaxFeeTotalV2(fees as EstimatedFeesV2)
  } else if (nativeEstimatedFeeSchema.safeParse(fees).success) {
    // For native fees without backend simulation (e.g. account deployment and declare)
    totalFee = estimatedFeeToMaxFeeTotal(fees as NativeEstimatedFee)
  } else if (typeof fees === "bigint") {
    // For native fees with paymaster (e.g. send)
    totalFee = fees
  } else {
    throw new Error("Invalid fees type")
  }

  // Check if token balance is sufficient to cover the total fee
  return feeToken.balance >= totalFee
}
