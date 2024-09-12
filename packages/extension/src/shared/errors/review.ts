import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum REVIEW_ERROR_MESSAGE {
  SIMULATE_AND_REVIEW_FAILED = "Something went wrong fetching review",
  NO_CALLS_FOUND = "No calls found",
  ONCHAIN_FEE_ESTIMATION_FAILED = "Failed to estimate fees onchain",
}

export type ReviewErrorMessage = keyof typeof REVIEW_ERROR_MESSAGE

export class ReviewError extends BaseError<ReviewErrorMessage> {
  constructor(payload: BaseErrorPayload<ReviewErrorMessage>) {
    super(payload, REVIEW_ERROR_MESSAGE)
    this.name = "ReviewError"
  }
}
