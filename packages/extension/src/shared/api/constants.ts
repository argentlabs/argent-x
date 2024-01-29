import { isString } from "lodash-es"
import urlJoin from "url-join"

function isValidString(str: any): str is string {
  return isString(str) && str.length > 0
}

export const ARGENT_API_BASE_URL = process.env.ARGENT_API_BASE_URL as any // we validate it with isValidString

export const ARGENT_API_ENABLED = isValidString(ARGENT_API_BASE_URL)

export const ARGENT_API_TOKENS_PRICES_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/prices?chain=starknet")
  : undefined

export const ARGENT_API_TOKENS_INFO_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/info?chain=starknet")
  : undefined

export const ARGENT_TRANSACTION_REVIEW_API_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "reviewer")
  : undefined

export const ARGENT_TRANSACTION_REVIEW_API_ENABLED = isValidString(
  ARGENT_TRANSACTION_REVIEW_API_BASE_URL,
)

export const ARGENT_TRANSACTION_REVIEW_STARKNET_URL =
  ARGENT_TRANSACTION_REVIEW_API_ENABLED
    ? urlJoin(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ARGENT_TRANSACTION_REVIEW_API_BASE_URL!,
        "transactions/v2/review/starknet",
      )
    : undefined

export const ARGENT_X_STATUS_URL = process.env.ARGENT_X_STATUS_URL

export const ARGENT_X_STATUS_ENABLED = isValidString(ARGENT_X_STATUS_URL)

export const ARGENT_EXPLORER_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "explorer/starknet")
  : undefined

export const ARGENT_EXPLORER_ENABLED = isValidString(ARGENT_EXPLORER_BASE_URL)

export const ARGENT_TRANSACTION_BULK_SIMULATION_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "starknet/bulkSimulate")
  : undefined

export const ARGENT_TRANSACTION_SIMULATION_API_ENABLED = isValidString(
  ARGENT_TRANSACTION_BULK_SIMULATION_URL,
)

export const ARGENT_MULTISIG_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "multisig/starknet/")
  : undefined

export const ARGENT_MULTISIG_ENABLED =
  process.env.FEATURE_MULTISIG === "true" &&
  isValidString(ARGENT_MULTISIG_BASE_URL)

export const ARGENT_MULTISIG_URL = ARGENT_MULTISIG_ENABLED
  ? ARGENT_MULTISIG_BASE_URL
  : undefined

export const ARGENT_KNOWN_DAPPS_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/dapps")
  : undefined

export const ARGENT_ACCOUNT_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "account")
  : undefined

export const ARGENT_ACCOUNT_DISCOVERY_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "explorer/discover/starknet")
  : undefined

export const ARGENT_MULTISIG_DISCOVERY_URL = ARGENT_MULTISIG_URL
  ? urlJoin(ARGENT_MULTISIG_URL)
  : undefined

export const ARGENT_SWAP_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/swap")
  : undefined
