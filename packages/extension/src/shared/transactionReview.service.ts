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

export type ApiTransactionReviewAssessment = "warn" | "neutral" | "verified"

export interface ApiTransactionReviewResponse {
  assessment: ApiTransactionReviewAssessment
  reason?: string
  reviews: ApiTransactionReview[]
}

export interface ApiTransactionReview {
  assessment: ApiTransactionReviewAssessment
  assessmentReason?: string
  assessmentDetails: {
    contract_address: string
  }
  activity?: {
    value?: {
      token: {
        address: string
        name: string
        symbol: string
        decimals: number
        unknown: boolean
        type: string
      }
      amount: string
      /** usd converted fiat equivalent of token amount */
      usd: number
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
    return
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
