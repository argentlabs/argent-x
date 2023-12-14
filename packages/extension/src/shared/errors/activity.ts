import { BaseError, BaseErrorPayload } from "./baseError"

export enum ACTIVITY_ERROR_MESSAGES {
  FETCH_FAILED = "Failed to fetch activities",
  PARSING_FAILED = "Failed to parse backend response",
}

export type ActivityValidationErrorMessage =
  keyof typeof ACTIVITY_ERROR_MESSAGES

export class ActivityError extends BaseError<ActivityValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<ActivityValidationErrorMessage>) {
    super(payload, ACTIVITY_ERROR_MESSAGES)
    this.name = "AccountError"
  }
}
