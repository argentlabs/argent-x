import browser from "webextension-polyfill"
import { ensureArray } from "@argent/shared"
import { deserialize, serialize } from "superjson"
import type { AllowArray, Call } from "starknet"

import { ChromeRepository } from "../../storage/__new/chrome"
import {
  EstimatedFees,
  EstimatedFeesEnriched,
  IEstimatedFeesRepository,
} from "./fees.model"
import { objectHash } from "../../objectHash"

export const estimatedFeesRepo: IEstimatedFeesRepository =
  new ChromeRepository<EstimatedFeesEnriched>(browser, {
    namespace: "core:estimatedFees4",
    areaName: "local",
    compare: (a, b) => a.id === b.id,
    // we need to serialize/deserialize as we store bigints
    serialize,
    deserialize,
  })

// always use array as it is easier to compare
export function getIdForTransactions(transactions: AllowArray<Call>) {
  const transactionsArray = ensureArray(transactions)
  const id = objectHash(transactionsArray)
  return id
}

export const addEstimatedFee = async (
  estimatedFee: EstimatedFees,
  transactions: AllowArray<Call>,
) => {
  const id = getIdForTransactions(transactions)

  // If a transaction is already in the store, we update it with the new fees and timestamp
  // Otherwise, we add it to the store
  const newEstimatedFees: EstimatedFeesEnriched = {
    ...estimatedFee,
    id,
    timestamp: Date.now(),
  }

  await estimatedFeesRepo.upsert(newEstimatedFees)

  return newEstimatedFees
}

export const getEstimatedFees = async (
  transactions: AllowArray<Call>,
): Promise<EstimatedFeesEnriched | null> => {
  const id = getIdForTransactions(transactions)
  const [fee] = await estimatedFeesRepo.get(
    (estimatedFee) => estimatedFee.id === id,
  )

  if (!fee) {
    console.error(`No fees found for transactions: `, transactions)
    return null
  }

  return fee
}
