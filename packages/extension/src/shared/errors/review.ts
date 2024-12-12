import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum REVIEW_ERROR_MESSAGE {
  SIMULATE_AND_REVIEW_FAILED = "Something went wrong fetching review",
  NO_CALLS_FOUND = "No calls found",
  ONCHAIN_FEE_ESTIMATION_FAILED = "Failed to estimate fees onchain",
  INVALID_TRANSACTION_ACTION = "Invalid transaction action",
}

export type ReviewErrorMessage = keyof typeof REVIEW_ERROR_MESSAGE

export class ReviewError extends BaseError<ReviewErrorMessage> {
  constructor(payload: BaseErrorPayload<ReviewErrorMessage>) {
    super(payload, REVIEW_ERROR_MESSAGE)
    this.name = "ReviewError"
  }
}
