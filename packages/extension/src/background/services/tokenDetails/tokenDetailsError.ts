import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum TOKEN_DETAILS_ERROR_MESSAGES {
  TOKENS_DETAILS_API_URL = "TOKENS_DETAILS_API_URL is not defined",
  TOKENS_GRAPH_INFO_URL = "TOKENS_GRAPH_INFO_URL is not defined",
}

export type TokenDetailsValidationErrorMessage =
  keyof typeof TOKEN_DETAILS_ERROR_MESSAGES

export class TokenDetailsError extends BaseError<TokenDetailsValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<TokenDetailsValidationErrorMessage>) {
    super(payload, TOKEN_DETAILS_ERROR_MESSAGES)
    this.name = "TokenError"
  }
}
