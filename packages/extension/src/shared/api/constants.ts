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

export const ARGENT_X_NEWS_URL = process.env.ARGENT_X_NEWS_URL

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

export const ARGENT_X_LEGAL_PRIVACY_POLICY_URL =
  "https://www.argent.xyz/legal/privacy/argent-x/"

export const ARGENT_X_LEGAL_TERMS_OF_SERVICE_URL =
  "https://www.argent.xyz/legal/argent-extension-terms-of-service/"

const ARGENT_HEALTHCHECK_BASE_URL = process.env
  .ARGENT_HEALTHCHECK_BASE_URL as any // we validate it with isValidString

const ARGENT_HEALTHCHECK_ENABLED = isValidString(ARGENT_HEALTHCHECK_BASE_URL)

export const PROVISION_STATUS_ENDPOINT = ARGENT_HEALTHCHECK_ENABLED
  ? urlJoin(ARGENT_HEALTHCHECK_BASE_URL, "provision-status.json")
  : undefined

// GOERLI only, mainnet ones are still unknown
export const PROVISION_CONTRACT_ADDRESSES =
  process.env.ARGENT_X_ENVIRONMENT === "prod"
    ? [
        "0x03ce54e2104cd65bb2117c8d401b0ce30139fafffb2ebf8811f70b362d8fac6e",
        "0x0128492AB86D97475CDC074A06A827014E6AA10DA9BD745B26CCAFB8C1A54A9A",
        "0x06793D9E6ED7182978454C79270E5B14D2655204BA6565CE9B0AA8A3C3121025",
        "0x0517daba3622259ae4fffab72bb716d89c30df0994c6ab25ede61bd139639724",
      ]
    : [
        "0x02b2e8b8eb3429540c58c0dc69ebb2981267196fe0ca2e361056b852445ee766",
        "0x0512e19eb3daa35c94592a251f939c8bb7e81795b6eca6148964b5778bf7dd6d",
        "0x0761357121b07055dae758496c210da9ab7b422a831a6b90efa3704d85d128d0",
        "0x0524983b9b9322fa94d94758d9d8cdd94c936479c77775babcc921bf1e1ad2b6",
      ]

export const ARGENT_NETWORK_STATUS = ARGENT_API_ENABLED
  ? urlJoin(ARGENT_API_BASE_URL, "status/starknet")
  : undefined
