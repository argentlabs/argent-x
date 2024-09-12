import { ReviewOfTransaction, Action } from "@argent/x-shared/simulation"

export type ApiTransactionReviewTargettedDapp = {
  name: string
  description: string
  logoUrl: string
  links: {
    name: string
    url: string
    position: number
  }[]
}

export const transactionReviewHasSwap = (
  transactionReview?: ReviewOfTransaction,
) => {
  if (!transactionReview) {
    return false
  }
  for (const review of transactionReview.reviews) {
    if (
      review.action.name === "multi_route_swap" ||
      review.action.name === "Jediswap_swap" ||
      review.action.name === "Avnu_swap"
    ) {
      return true
    }
  }
  return false
}

export const transactionReviewHasTransfer = (
  transactionReview?: ReviewOfTransaction,
) => {
  if (!transactionReview) {
    return false
  }
  for (const review of transactionReview.reviews) {
    if (review.action.name === "ERC20_transfer") {
      return true
    }
  }
  return false
}

export const getTransactionActionByType = (
  actionName?: string,
  transactionReview?: ReviewOfTransaction,
): Action | undefined => {
  if (!transactionReview || !actionName) {
    return
  }
  for (const review of transactionReview.reviews) {
    if (review.action?.name.includes(actionName)) {
      return review.action
    }
  }
}
