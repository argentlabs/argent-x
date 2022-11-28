import objectHash from "object-hash"
import { useMemo } from "react"
import { Call, GatewayError } from "starknet"
import useSwr from "swr"

import {
  estimateDeployment,
  estimateTransactions,
} from "../services/estimateFee"
import { reviewTransaction } from "../services/review"

export const useReview = (transactions: Call[]) => {
  const hash = useMemo(() => objectHash({ transactions }), [transactions])
  const { data: review } = useSwr(["services/review", hash], () =>
    reviewTransaction(transactions),
  )

  return review
}

export const useEstimateTransactions = (transactions: Call[]) => {
  const hash = useMemo(() => objectHash({ transactions }), [transactions])
  const { data: executionFees, error } = useSwr(
    ["services/estimateFee/estimateTransactions", hash],
    () => estimateTransactions(transactions),
    {
      shouldRetryOnError(err) {
        if (err instanceof GatewayError) {
          return false
        }
        return true
      },
    },
  )

  return { executionFees, error }
}

export const useEstimateDeployment = () => {
  const { data: deploymentFees } = useSwr(
    "services/estimateFee/estimateDeployment",
    () => estimateDeployment(),
  )

  return deploymentFees
}
