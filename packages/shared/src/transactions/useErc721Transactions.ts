import { useMemo } from "react"

import type { AggregatedSimData } from "./aggregatedSimDataTypes"

export const getERC721Transactions = (aggregatedData?: AggregatedSimData[]) => {
  if (!aggregatedData) {
    return []
  }

  return aggregatedData.filter((data) => {
    return data.token.type === "erc721"
  })
}

export const useERC721Transactions = (aggregatedData?: AggregatedSimData[]) => {
  return useMemo(() => getERC721Transactions(aggregatedData), [aggregatedData])
}

export const hasERC721Transactions = (aggregatedData?: AggregatedSimData[]) => {
  return getERC721Transactions(aggregatedData).length > 0
}

export const useHasERC721Transaction = (
  aggregatedData?: AggregatedSimData[],
) => {
  return useMemo(() => hasERC721Transactions(aggregatedData), [aggregatedData])
}
