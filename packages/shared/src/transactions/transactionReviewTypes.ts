import { Call } from "starknet"

import { ApiData } from "../http/apiData"

export interface ApiTransactionReview {
  assessment: ApiTransactionReviewAssessment
  assessmentReason?: ApiTransactionReviewAssessmentReason
  assessmentDetails: {
    contract_address: string
  }
  activity?: ApiTransactionReviewActivity
}

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

export interface IUseTransactionReview {
  address?: string
  network?: ApiTransactionReviewNetwork
  transactions: Call | Call[]
  transactionReviewEnabled?: boolean
  apiData: ApiData
}

export interface ApiTransactionReviewToken {
  address: string
  name?: string
  symbol?: string
  decimals: number
  unknown: boolean
  type: "ERC20" | "ERC721"
}

export const apiTransactionReviewActivityType = [
  "account-upgrade",
  "approve",
  "set-approval-for-all",
  "swap",
  "transfer",
] as const

export type ApiTransactionReviewSlippageType = "equals" | "at_least" | "at_most"

export type ApiTransactionReviewActivityType =
  (typeof apiTransactionReviewActivityType)[number]

export type TransactionReviewWithType = ApiTransactionReview & {
  type: ApiTransactionReviewActivityType
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

export interface ApiTransactionReviewResponse {
  assessment: ApiTransactionReviewAssessment
  reason?: ApiTransactionReviewAssessmentReason
  reviews: ApiTransactionReview[]
  targetedDapp: ApiTransactionReviewTargettedDapp
}

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
