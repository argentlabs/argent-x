import { isEqualAddress } from "@argent/x-shared"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import { useMemo } from "react"
import type { BaseToken } from "../../../../shared/token/__new/types/token.model"

export const useFeeFromEstimatedFees = (
  estimatedFees: EstimatedFeesV2[] = [],
  feeToken: BaseToken,
) => {
  return useMemo(
    () =>
      estimatedFees.find((fee) =>
        isEqualAddress(fee.transactions.feeTokenAddress, feeToken.address),
      ),
    [estimatedFees, feeToken],
  )
}
