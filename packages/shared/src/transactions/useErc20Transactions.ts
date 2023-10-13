import { useMemo } from "react"

import { AggregatedSimData } from "./aggregatedSimDataTypes"

export const getERC20Transactions = (aggregatedData?: AggregatedSimData[]) => {
  if (!aggregatedData) {
    return []
  }
  return aggregatedData.filter((data) => {
    return data.token.type === "erc20"
  })
}

export const useERC20Transactions = (aggregatedData?: AggregatedSimData[]) => {
  return useMemo(() => getERC20Transactions(aggregatedData), [aggregatedData])
}

export const hasERC20Transactions = (aggregatedData?: AggregatedSimData[]) => {
  return getERC20Transactions(aggregatedData).length > 0
}

export const hasIncomingERC20Transactions = (
  aggregatedData?: AggregatedSimData[],
) => {
  const erc20Transactions = getERC20Transactions(aggregatedData)

  return erc20Transactions.some((transaction) => transaction.amount > 0n)
}

export const hasOutgoingERC20Transactions = (
  aggregatedData?: AggregatedSimData[],
) => {
  const erc20Transactions = getERC20Transactions(aggregatedData)

  return erc20Transactions.some((transaction) => transaction.amount < 0n)
}
