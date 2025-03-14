import type { TransactionAction } from "@argent/x-shared"
import { ensureArray } from "@argent/x-shared"
import { deserialize, serialize } from "superjson"
import { TransactionType } from "starknet"

import { ChromeRepository } from "../../storage/__new/chrome"
import type {
  EstimatedFeesV2,
  EstimatedFeesV2Enriched,
} from "@argent/x-shared/simulation"
import { objectHash } from "../../objectHash"
import { assertNever } from "../../utils/assertNever"
import type { IEstimatedFeesRepository } from "./fees.model"
import { browserStorage } from "../../storage/browser"

export const estimatedFeesRepo: IEstimatedFeesRepository =
  new ChromeRepository<EstimatedFeesV2Enriched>(browserStorage, {
    namespace: "core:estimatedFees6",
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
  estimatedFee: EstimatedFeesV2,
  action: TransactionAction,
  isSubsidised?: boolean,
) => {
  const id = getIdForTransactions(action)

  // If a transaction is already in the store, we update it with the new fees and timestamp
  // Otherwise, we add it to the store
  const newEstimatedFees: EstimatedFeesV2Enriched = {
    ...estimatedFee,
    id,
    timestamp: Date.now(),
    isSubsidised: estimatedFee.type === "paymaster" && isSubsidised, // Only paymaster fees can be subsidised
  }

  await estimatedFeesRepo.upsert(newEstimatedFees)

  return newEstimatedFees
}

export const getEstimatedFees = async (
  action: TransactionAction,
  feesStore: IEstimatedFeesRepository = estimatedFeesRepo,
): Promise<EstimatedFeesV2Enriched | null> => {
  const id = getIdForTransactions(action)
  const [fee] = await feesStore.get((estimatedFee) => estimatedFee.id === id)

  if (!fee) {
    console.error(
      `No fees found for ${action.type} transaction: `,
      action.payload,
    )
    return null
  }

  return fee
}
