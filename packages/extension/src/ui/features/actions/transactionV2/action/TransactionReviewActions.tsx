import { FC } from "react"

import type { ReviewOfTransaction } from "../../../../../shared/transactionReview/schema"
import { TransactionReviewAction } from "./TransactionReviewAction"

interface TransactionReviewActiosProps {
  reviewOfTransaction: ReviewOfTransaction
  initiallyExpanded?: boolean
}

export const TransactionReviewActions: FC<TransactionReviewActiosProps> = ({
  reviewOfTransaction,
  initiallyExpanded,
}) => {
  return reviewOfTransaction?.reviews.map((review, index) => {
    return (
      <TransactionReviewAction
        key={`review-${index}-${review.action.name}`}
        action={review.action}
        initiallyExpanded={initiallyExpanded}
        assessment={review.assessment}
      />
    )
  })
}
