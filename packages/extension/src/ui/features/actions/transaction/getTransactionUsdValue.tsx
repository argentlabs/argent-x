import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"
import { getReviewOfTransaction } from "../../../../shared/transactionReview.service"

export const getTransactionUsdValue = (
  transactionReview?: Pick<EnrichedSimulateAndReviewV2, "transactions">,
): number | undefined => {
  const reviewOfTransaction = getReviewOfTransaction(transactionReview)

  const action = reviewOfTransaction?.reviews[0]?.action
  if (action) {
    const amountProperty = [
      ...action.properties,
      ...(action.defaultProperties || []),
    ].find((p) => p.type === "amount")

    if (amountProperty) {
      if (isNaN(Number(amountProperty.usd))) {
        return
      }
      return Number(amountProperty.usd)
    }
  }
}
