import objectHash from "object-hash"
import { useMemo } from "react"
import { Call, GatewayError } from "starknet"
import useSwr from "swr"

import { parseStarknetError } from "../services/errorParser"
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
  const { data: executionFees, error: rawError } = useSwr(
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

  const error = useMemo(() => {
    if (rawError instanceof Error) {
      return parseStarknetError(rawError)
    }
    return rawError
  }, [rawError])

  return { executionFees, error }
}

export const useEstimateDeployment = () => {
  const { data: deploymentFees } = useSwr(
    "services/estimateFee/estimateDeployment",
    () => estimateDeployment(),
  )

  return deploymentFees
}
