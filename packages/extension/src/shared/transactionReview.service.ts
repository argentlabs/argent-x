import { isArray, lowerCase } from "lodash-es"
import { Call } from "starknet"

import { ARGENT_TRANSACTION_REVIEW_STARKNET_URL } from "./api/constants"
import { Fetcher, fetcher } from "./api/fetcher"

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

export type ApiTransactionReviewTargettedDapp = {
  name: string
  description: string
  iconUrl: string
  links: {
    name: string
    url: string
    position: number
  }[]
}

export interface ApiTransactionReviewResponse {
  assessment: ApiTransactionReviewAssessment
  reason?: ApiTransactionReviewAssessmentReason
  reviews: ApiTransactionReview[]
  targetedDapp: ApiTransactionReviewTargettedDapp
}

export const apiTransactionReviewActivityType = {
  "account-upgrade": "account-upgrade",
  approve: "approve",
  "set-approval-for-all": "set-approval-for-all",
  swap: "swap",
  transfer: "transfer",
} as const

export type ApiTransactionReviewActivityType =
  (typeof apiTransactionReviewActivityType)[keyof typeof apiTransactionReviewActivityType]

export type TransactionReviewWithType = ApiTransactionReview & {
  type: ApiTransactionReviewActivityType
}

export type ApiTransactionReviewSlippageType = "equals" | "at_least" | "at_most"

export interface ApiTransactionReviewToken {
  address: string
  name?: string
  symbol?: string
  decimals: number
  unknown: boolean
  type: "ERC20" | "ERC721"
}

export interface ApiTransactionReviewActivity {
  value?: {
    token: ApiTransactionReviewToken
    tokenId?: string
    amount?: string
    /** usd converted fiat equivalent of token amount */
    usd?: number
    slippage: ApiTransactionReviewSlippageType
  }
  dapp?: {
    address: string
    name: string
  }
  src?: {
    token: ApiTransactionReviewToken
    amount: string
    usd: number
    slippage: ApiTransactionReviewSlippageType
  }
  dst?: {
    token: ApiTransactionReviewToken
    amount: string
    usd: number
    slippage: ApiTransactionReviewSlippageType
  }
  recipient?: string
  spender?: string
  type: ApiTransactionReviewActivityType
}

export interface ApiTransactionReview {
  assessment: ApiTransactionReviewAssessment
  assessmentReason?: ApiTransactionReviewAssessmentReason
  assessmentDetails: {
    contract_address: string
  }
  activity?: ApiTransactionReviewActivity
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
  fetcher?: Fetcher
}

export const fetchTransactionReview = ({
  network,
  accountAddress,
  transactions,
  fetcher: fetcherImpl = fetcher,
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
  return fetcherImpl(ARGENT_TRANSACTION_REVIEW_STARKNET_URL, {
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
  const suffix = transactionReview.reason
    ? ` (Reason: ${lowerCase(transactionReview.reason)})`
    : ""
  const reason = warn
    ? transactionReview.reason === "recipient_is_token_address"
      ? "You are sending tokens to their own address. This is likely to burn them."
      : `This transaction has been flagged as dangerous. We recommend you reject this transaction unless you are sure.${suffix}`
    : undefined
  return {
    warn,
    reason,
  }
}

/** finds activity of type 'swap */
export const getTransactionReviewSwap = (
  transactionReview?: ApiTransactionReviewResponse,
): ApiTransactionReview | undefined => {
  if (!transactionReview) {
    return
  }
  for (const review of transactionReview.reviews) {
    if (review.activity?.type === "swap") {
      return review
    }
  }
}

export const getNFTTransferActivity = (
  transactionReview?: ApiTransactionReviewResponse,
) => {
  if (!transactionReview) {
    return
  }
}

export const getTransactionReviewActivityOfType = (
  type: ApiTransactionReviewActivityType,
  transactionReview?: ApiTransactionReviewResponse,
): ApiTransactionReviewActivity | undefined => {
  if (!transactionReview) {
    return
  }
  for (const review of transactionReview.reviews) {
    if (review.activity?.type === type) {
      return review.activity
    }
  }
}

export const getTransactionReviewHasSwap = (
  transactionReview?: ApiTransactionReviewResponse,
) => {
  return !!getTransactionReviewSwap(transactionReview)
}

export const getTransactionReviewWithType = (
  transactionReview?: ApiTransactionReviewResponse,
): TransactionReviewWithType | undefined => {
  if (!transactionReview) {
    return
  }
  for (const review of transactionReview.reviews) {
    if (review.activity?.type) {
      return {
        ...review,
        type: apiTransactionReviewActivityType[review.activity?.type],
      }
    }
  }
}
