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

export const ARGENT_API_TOKENS_REPORT_SPAM_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/scamTokenReports")
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

export const ARGENT_X_NEWS_URL = process.env.ARGENT_X_NEWS_URL

export const ARGENT_EXPLORER_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "explorer/starknet")
  : undefined

export const ARGENT_EXPLORER_ENABLED = isValidString(ARGENT_EXPLORER_BASE_URL)

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

export const ARGENT_ACCOUNT_PREFERENCES_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "account")
  : undefined

export const ARGENT_ACCOUNT_DISCOVERY_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "explorer/discover/starknet")
  : undefined

export const ARGENT_SMART_ACCOUNT_DISCOVERY_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "explorer/discover/starknet/2fa")
  : undefined

export const ARGENT_MULTISIG_DISCOVERY_URL = ARGENT_MULTISIG_URL
  ? urlJoin(ARGENT_MULTISIG_URL)
  : undefined

export const ARGENT_SWAP_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "tokens/swap")
  : undefined

export const ARGENT_X_LEGAL_PRIVACY_POLICY_URL =
  "https://www.argent.xyz/legal/privacy/argent-x/"

export const ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL =
  "https://www.argent.xyz/legal/argent-extension-terms-of-service/"

export const isProd = process.env.ARGENT_X_ENVIRONMENT === "prod"

export const ARGENT_NETWORK_STATUS = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "status/starknet")
  : undefined

export const isCI = Boolean(process.env.CI)

// Playwright sets via `browserContext.addInitScript("window.PLAYWRIGHT = true;")`
export const isPlaywright = Boolean(
  typeof window !== "undefined" && window.PLAYWRIGHT,
)

export const ARGENT_PORTFOLIO_MAINNET_BASE_URL =
  "https://portfolio.argent.xyz/overview/"
export const ARGENT_PORTFOLIO_GOERLI_BASE_URL =
  "https://portfolio.hydrogen.argent47.net/overview/"

export const ARGENT_REFERRAL_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "affiliate/referral")
  : undefined

export const ARGENT_OPTIMIZER_URL =
  process.env.ARGENT_OPTIMIZER_URL ?? "https://content.argent.net/image"

export const ARGENT_ACCOUNT_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "accounts/starknet")
  : undefined

export const ARGENT_ACCOUNTS_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "accounts")
  : undefined

// name resolution
export const ARGENT_NAME_RESOLUTION_API_BASE_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "name-resolution", "resolve")
  : undefined

export const TOPPER_WIDGET_ID = isProd
  ? "e03fb9ad-a21a-48f6-bbdf-47a23e5b8e74"
  : "975934b4-47ce-4329-bded-011c6ec3b8f3"
export const TOPPER_KEY_ID = isProd
  ? "11e7962e-7d2a-42d6-840d-83f1966a4696"
  : "f8b3a9b7-3abc-43bf-8f4b-41d4fac39f7c"
export const TOPPER_BASE_URL = isProd
  ? "https://app.topperpay.com/"
  : "https://app.sandbox.topperpay.com/"

export const ARGENT_TOKENS_GRAPH_API_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "/tokens/graph")
  : undefined

export const ARGENT_TOKENS_INFO_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "/tokens/info")
  : undefined

export const ARGENT_TOKENS_DEFI_INVESTMENTS_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "/tokens/defi")
  : undefined

export const ARGENT_RELAYER_URL = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "/relayer/paymaster")
  : undefined
