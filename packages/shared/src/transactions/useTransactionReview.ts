import { isArray, lowerCase } from "lodash-es"
import objectHash from "object-hash"
import { useCallback, useMemo } from "react"
import urlJoin from "url-join"

import { fetchData } from "../http/fetcher"
import { useConditionallyEnabledSWR } from "../http/swr"
import {
  ApiTransactionReview,
  ApiTransactionReviewActivity,
  ApiTransactionReviewActivityType,
  ApiTransactionReviewRequestBody,
  ApiTransactionReviewResponse,
  IUseTransactionReview,
  TransactionReviewWithType,
} from "./transactionReviewTypes"

export const useTransactionReview = ({
  apiData: { apiBaseUrl, apiHeaders },
  address,
  network,
  transactionReviewEnabled = true,
  transactions,
}: IUseTransactionReview) => {
  const transactionReviewFetcher = useCallback(async () => {
    if (!address || !network) {
      return
    }

    if (!apiBaseUrl) {
      throw "Transaction review endpoint is not defined"
    }

    const ARGENT_TRANSACTION_REVIEW_STARKNET_URL = urlJoin(
      apiBaseUrl,
      "reviewer/transactions/review/starknet",
    )

    const calls = isArray(transactions) ? transactions : [transactions]
    const body: ApiTransactionReviewRequestBody = {
      network,
      account: address,
      calls,
    }

    return fetchData(ARGENT_TRANSACTION_REVIEW_STARKNET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...apiHeaders,
      },
      body: JSON.stringify(body),
    })

    // TODO: come back - dont rerender when fetcher reference changes
  }, [address, network, transactions])

  const hash = useMemo(
    () => objectHash({ transactions, address, network }),
    [transactions, address, network],
  )

  return useConditionallyEnabledSWR<ApiTransactionReviewResponse>(
    Boolean(transactionReviewEnabled),
    [hash, "transactionReview"],
    transactionReviewFetcher,
  )
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
  return undefined
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
  return undefined
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
        type: review.activity?.type,
      }
    }
  }
  return undefined
}
