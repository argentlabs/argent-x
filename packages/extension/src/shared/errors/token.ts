import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum TOKEN_ERROR_MESSAGES {
  NO_TOKEN_API_URL = "ARGENT_API_TOKENS_URL is not defined",
  NO_TOKEN_PRICE_API_URL = "ARGENT_API_TOKENS_PRICES_URL is not defined",
  NO_TOKEN_REPORT_SPAM_API_URL = "ARGENT_API_TOKENS_REPORT_SPAM_URL is not defined",
  TOKEN_PARSING_ERROR = "Unable to parse token data response",
  TOKEN_PRICE_PARSING_ERROR = "Unable to parse token price response",
  TOKEN_PRICE_NOT_FOUND = "Token price not found",
  TOKEN_NOT_FOUND = "Token not found",
  TOKEN_DETAILS_NOT_FOUND = "Token details not found",
  FEE_TOKEN_NOT_FOUND = "Fee token not found",
  UNABLE_TO_CALCULATE_CURRENCY_VALUE = "Unable to calculate currency value",
  UNSAFE_DECIMALS = "Unsafe decimals in token",
}

export type TokenValidationErrorMessage = keyof typeof TOKEN_ERROR_MESSAGES

export class TokenError extends BaseError<TokenValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<TokenValidationErrorMessage>) {
    super(payload, TOKEN_ERROR_MESSAGES)
    this.name = "TokenError"
  }
}
