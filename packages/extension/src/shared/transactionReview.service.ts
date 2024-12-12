import { isArray } from "lodash-es"
import type {
  Action,
  EnrichedSimulateAndReview,
  Property,
  ReviewOfTransaction,
} from "@argent/x-shared/simulation"

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
  if (!isArray(transactionReview?.reviews)) {
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

export const transactionReviewHasNft = (
  transactionReview?: ReviewOfTransaction,
) => {
  if (!transactionReview) {
    return false
  }
  for (const review of transactionReview.reviews) {
    if (review.action.name.includes("ERC721")) {
      return true
    }
  }
  return false
}

export const transactionReviewHasTransfer = (
  transactionReview?: ReviewOfTransaction,
) => {
  if (!isArray(transactionReview?.reviews)) {
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
  if (!isArray(transactionReview?.reviews) || !actionName) {
    return
  }
  for (const review of transactionReview.reviews) {
    if (review.action?.name.includes(actionName)) {
      return review.action
    }
  }
}

export const getTransactionReviewPropertyByType = (
  propertyType?: string,
  transactionReview?: ReviewOfTransaction,
): Property | undefined => {
  if (!transactionReview || !propertyType) {
    return
  }
  for (const review of transactionReview.reviews) {
    for (const defaultProperty of review.action.defaultProperties || []) {
      if (defaultProperty.type === propertyType) {
        return defaultProperty
      }
    }
    for (const property of review.action.properties) {
      if (property.type === propertyType) {
        return property
      }
    }
  }
}

export const getTransactionReviewSwapToken = (
  transactionReview?: EnrichedSimulateAndReview,
  isSource?: boolean,
) => {
  return transactionReview?.transactions?.[0]?.simulation?.summary?.find(
    (p) => p.sent === isSource,
  )?.token
}

export const getReviewOfTransaction = (
  transactionReview?: EnrichedSimulateAndReview,
) => {
  return transactionReview?.transactions?.[0]?.reviewOfTransaction
}
