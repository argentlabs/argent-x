import { isString } from "lodash-es"
import urlJoin from "url-join"

export const ARGENT_API_BASE_URL = process.env.ARGENT_API_BASE_URL as string

export const ARGENT_API_ENABLED =
  isString(ARGENT_API_BASE_URL) && ARGENT_API_BASE_URL.length > 0

export const ARGENT_API_TOKENS_PRICES_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/prices?chain=starknet")
  : undefined

export const ARGENT_API_TOKENS_INFO_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/info?chain=starknet")
  : undefined

export const ARGENT_TRANSACTION_REVIEW_API_BASE_URL = process.env
  .ARGENT_TRANSACTION_REVIEW_API_BASE_URL as string

export const ARGENT_TRANSACTION_REVIEW_API_ENABLED =
  isString(ARGENT_TRANSACTION_REVIEW_API_BASE_URL) &&
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL.length > 0

export const ARGENT_TRANSACTION_REVIEW_STARKNET_URL =
  ARGENT_TRANSACTION_REVIEW_API_ENABLED
    ? urlJoin(
        ARGENT_TRANSACTION_REVIEW_API_BASE_URL,
        "transactions/review/starknet",
      )
    : undefined

export const ARGENT_X_STATUS_URL = process.env.ARGENT_X_STATUS_URL as string

export const ARGENT_X_STATUS_ENABLED =
  isString(ARGENT_X_STATUS_URL) && ARGENT_X_STATUS_URL.length > 0

export const ARGENT_EXPLORER_BASE_URL = process.env.ARGENT_EXPLORER_BASE_URL

export const ARGENT_EXPLORER_ENABLED =
  isString(ARGENT_EXPLORER_BASE_URL) && ARGENT_EXPLORER_BASE_URL.length > 0

export const ARGENT_TRANSACTION_SIMULATION_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "starknet/simulate")
  : undefined

export const ARGENT_TRANSACTION_SIMULATION_API_ENABLED =
  isString(ARGENT_TRANSACTION_SIMULATION_URL) &&
  ARGENT_TRANSACTION_SIMULATION_URL.length > 0
