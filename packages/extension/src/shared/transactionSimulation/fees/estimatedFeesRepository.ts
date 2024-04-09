import browser from "webextension-polyfill"
import { TransactionAction, ensureArray } from "@argent/x-shared"
import { deserialize, serialize } from "superjson"
import { TransactionType } from "starknet"

import { ChromeRepository } from "../../storage/__new/chrome"
import {
  EstimatedFees,
  EstimatedFeesEnriched,
  IEstimatedFeesRepository,
} from "./fees.model"
import { objectHash } from "../../objectHash"
import { assertNever } from "../../utils/assertNever"

export const estimatedFeesRepo: IEstimatedFeesRepository =
  new ChromeRepository<EstimatedFeesEnriched>(browser, {
    namespace: "core:estimatedFees5",
    areaName: "session", // we want to clear it on session end, no need to keep this around
    compare: (a, b) => a.id === b.id,
    // we need to serialize/deserialize as we store bigints
    serialize,
    deserialize,
  })

export function getIdForTransactions(action: TransactionAction) {
  if (action.type === TransactionType.INVOKE) {
    // For INVOKE, ensure array for consistent hashing
    return objectHash(ensureArray(action.payload))
  } else if (
    action.type === TransactionType.DECLARE ||
    action.type === TransactionType.DEPLOY ||
    action.type === TransactionType.DEPLOY_ACCOUNT
  ) {
    // For DECLARE, DEPLOY, and DEPLOY_ACCOUNT, payload is already in the correct form
    return objectHash(action.payload)
  } else {
    assertNever(action)
    throw new Error(`Unknown transaction type: ${action}`)
  }
}

export const addEstimatedFee = async (
  estimatedFee: EstimatedFees,
  action: TransactionAction,
) => {
  const id = getIdForTransactions(action)

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
  action: TransactionAction,
): Promise<EstimatedFeesEnriched | null> => {
  const id = getIdForTransactions(action)
  const [fee] = await estimatedFeesRepo.get(
    (estimatedFee) => estimatedFee.id === id,
  )

  if (!fee) {
    console.error(
      `No fees found for ${action.type} transaction: `,
      action.payload,
    )
    return null
  }

  return fee
}
