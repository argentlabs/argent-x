import { useMemo } from "react"

import { AggregatedSimData } from "./useTransactionSimulatedData"

export const getERC721Transfers = (aggregatedData?: AggregatedSimData[]) => {
  if (!aggregatedData) {
    return []
  }

  return aggregatedData.filter((data) => {
    return data.token.type === "erc721"
  })
}

export const useERC721Transfers = (aggregatedData?: AggregatedSimData[]) => {
  return useMemo(() => getERC721Transfers(aggregatedData), [aggregatedData])
}

export const hasERC721Transfer = (aggregatedData?: AggregatedSimData[]) => {
  return getERC721Transfers(aggregatedData).length > 0
}

export const useHasERC721Transfer = (aggregatedData?: AggregatedSimData[]) => {
  return useMemo(() => hasERC721Transfer(aggregatedData), [aggregatedData])
}
