import browser from "webextension-polyfill"
import { isEqual } from "lodash-es"

import { AllowArray, Call } from "starknet"

import { ChromeRepository } from "../../storage/__new/chrome"
import {
  EstimatedFees,
  EstimatedFeesEnriched,
  IEstimatedFeesRepository,
} from "./fees.model"

export function isEqualTransactions(
  transactionA: Call | Call[],
  transactionB: Call | Call[],
): boolean {
  const transactionAArray = Array.isArray(transactionA)
    ? transactionA
    : [transactionA]
  const transactionBArray = Array.isArray(transactionB)
    ? transactionB
    : [transactionB]
  return isEqual(transactionAArray, transactionBArray)
}

export const estimatedFeesRepo: IEstimatedFeesRepository =
  new ChromeRepository<EstimatedFeesEnriched>(browser, {
    namespace: "core:estimatedFees2",
    areaName: "local",
    compare: (a, b) => isEqualTransactions(a.transactions, b.transactions),
  })

export const addEstimatedFees = async (
  estimatedFees: EstimatedFees,
  transactions: AllowArray<Call>,
) => {
  // always use array as it is easier to compare
  const transactionsArray = Array.isArray(transactions)
    ? transactions
    : [transactions]

  // If a transaction is already in the store, we update it with the new fees and timestamp
  // Otherwise, we add it to the store
  const newEstimatedFees = {
    ...estimatedFees,
    transactions: transactionsArray,
    timestamp: Date.now(),
  }

  await estimatedFeesRepo.upsert(newEstimatedFees)
  return newEstimatedFees
}

export const getEstimatedFees = async (
  transactions: AllowArray<Call>,
): Promise<EstimatedFeesEnriched | null> => {
  const [fees] = await estimatedFeesRepo.get(
    (fees) => isEqualTransactions(fees.transactions, transactions), // No need to explicitly make an array as isEqualTransactions does it for us
  )

  if (!fees) {
    console.error(`No fees found for transactions: `, transactions)
    return null
  }

  return fees
}
