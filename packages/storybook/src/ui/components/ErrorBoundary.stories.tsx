import { ErrorBoundaryFallbackWithCopyError } from "@argent-x/extension/src/ui/components/ErrorBoundaryFallbackWithCopyError"

export default {
  component: ErrorBoundaryFallbackWithCopyError,
}

const errorPayload = `v5.18.4

{
  "stack": "TokenError: Token 0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49 not found\n    at chrome-extension://gienphendhddnhfjnjoebkmaleechdnb/main.js:124488:13\n    at Array.map (<anonymous>)\n    at addCurrencyValueToTokensList (chrome-extension://gienphendhddnhfjnjoebkmaleechdnb/main.js:124484:28)\n    at Object.read (chrome-extension://gienphendhddnhfjnjoebkmaleechdnb/main.js:124522:14)",
  "message": "Token 0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49 not found",
  "errorMessages": {
    "NO_TOKEN_API_URL": "ARGENT_API_TOKENS_URL is not defined",
    "NO_TOKEN_PRICE_API_URL": "ARGENT_API_TOKENS_PRICES_URL is not defined",
    "TOKEN_PARSING_ERROR": "Unable to parse token data response",
    "TOKEN_PRICE_PARSING_ERROR": "Unable to parse token price response",
    "TOKEN_PRICE_NOT_FOUND": "Token price not found",
    "TOKEN_NOT_FOUND": "Token not found",
    "TOKEN_DETAILS_NOT_FOUND": "Token details not found",
    "FEE_TOKEN_NOT_FOUND": "Fee token not found",
    "UNABLE_TO_CALCULATE_CURRENCY_VALUE": "Unable to calculate currency value",
    "UNSAFE_DECIMALS": "Unsafe decimals in token"
  },
  "name": "TokenError",
  "code": "TOKEN_NOT_FOUND",
  "__sentry_captured__": true
}
`

export const Default = {
  args: { errorPayload },
}

export const PrivacyErrorReporting = {
  args: { errorPayload, privacyErrorReporting: true },
}
