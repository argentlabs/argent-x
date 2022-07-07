import { isArray, isString } from "lodash-es"
import { Call } from "starknet"
import urlJoin from "url-join"

import { fetcher } from "./utils/fetcher"

const ARGENT_TRANSACTION_REVIEW_API_BASE_URL = process.env
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

export type ApiTransactionReviewAssessment =
  | "warn"
  | "neutral"
  | "partial"
  | "verified"

export type ApiTransactionReviewAssessmentReason =
  | "account_upgrade_to_unknown_implementation"
  | "address_is_black_listed"
  | "amount_mismatch_too_low"
  | "amount_mismatch_too_high"
  | "dst_token_black_listed"
  | "internal_service_issue"
  | "multi_calls_on_account"
  | "recipient_is_not_current_account"
  | "recipient_is_token_address"
  | "recipient_is_black_listed"
  | "spender_is_black_listed"
  | "operator_is_black_listed"
  | "src_token_black_listed"
  | "unknown_token"

export interface ApiTransactionReviewResponse {
  assessment: ApiTransactionReviewAssessment
  reason?: ApiTransactionReviewAssessmentReason
  reviews: ApiTransactionReview[]
}

export interface ApiTransactionReview {
  assessment: ApiTransactionReviewAssessment
  assessmentReason?: ApiTransactionReviewAssessmentReason
  assessmentDetails: {
    contract_address: string
  }
  activity?: {
    value?: {
      token: {
        address: string
        name?: string
        symbol?: string
        decimals: number
        unknown: boolean
        type: string
      }
      tokenId?: string
      amount?: string
      /** usd converted fiat equivalent of token amount */
      usd?: number
      slippage: string
    }
    recipient?: string
    spender?: string
    type: string
  }
}

export type ApiTransactionReviewNetwork =
  | "mainnet"
  | "morden"
  | "ropsten"
  | "rinkeby"
  | "goerli"
  | "kovan"

export interface ApiTransactionReviewRequestBody {
  network: ApiTransactionReviewNetwork
  account: string
  calls: Call[]
}

export interface IFetchTransactionReview {
  network: ApiTransactionReviewNetwork
  accountAddress: string
  transactions: Call | Call[]
}

export const fetchTransactionReview = ({
  network,
  accountAddress,
  transactions,
}: IFetchTransactionReview) => {
  if (!ARGENT_TRANSACTION_REVIEW_STARKNET_URL) {
    throw "Transaction review endpoint is not defined"
  }
  const calls = isArray(transactions) ? transactions : [transactions]
  const body: ApiTransactionReviewRequestBody = {
    network,
    account: accountAddress,
    calls,
  }
  return fetcher(ARGENT_TRANSACTION_REVIEW_STARKNET_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

export const getDisplayWarnAndReasonForTransactionReview = (
  transactionReview?: Pick<
    ApiTransactionReviewResponse,
    "assessment" | "reason"
  >,
) => {
  if (!transactionReview) {
    return {}
  }
  const warn = transactionReview.assessment === "warn"
  const reason = warn
    ? transactionReview.reason === "recipient_is_token_address"
      ? "You are sending tokens to their own address. This is likely to burn them."
      : "This transaction has been flagged as dangerous. We recommend you reject this transaction unless you are sure."
    : undefined
  return {
    warn,
    reason,
  }
}
