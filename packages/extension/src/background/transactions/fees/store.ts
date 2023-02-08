import { isEqual } from "lodash-es"
import { Call } from "starknet5"

import { ArrayStorage } from "../../../shared/storage"

type EstimatedFees = {
  amount: string
  suggestedMaxFee: string
  accountDeploymentFee?: string
  maxADFee?: string
  transactions: Call | Call[]
}

type EstimatedFeesEnriched = EstimatedFees & {
  timestamp: number
}

export const estimatedFeesStore = new ArrayStorage<EstimatedFeesEnriched>([], {
  namespace: "core:estimatedFees",
  areaName: "session",
})

const timestampInSeconds = (): number => Math.floor(Date.now() / 1000)

export const addEstimatedFees = (estimatedFees: EstimatedFees) => {
  const newEstimatedFees = {
    ...estimatedFees,
    timestamp: timestampInSeconds(),
  }
  return estimatedFeesStore.push(newEstimatedFees)
}

export const getEstimatedFees = async (
  transactions: Call | Call[],
): Promise<EstimatedFeesEnriched | null> => {
  const fees = await estimatedFeesStore.get((value) =>
    isEqual(value.transactions, transactions),
  )
  const FIFTEEN_SECONDS = 15
  const feesExist = fees.length > 0
  const areFeesOutdated =
    feesExist &&
    fees[0].timestamp + FIFTEEN_SECONDS < Math.floor(Date.now() / 1000)

  if (feesExist && !areFeesOutdated) {
    return fees[0]
  }
  return null
}
