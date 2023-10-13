import { Call } from "starknet"
import {
  estimatedFeesRepo,
  isEqualTransactions,
} from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomFamily } from "jotai/utils"
import { atom } from "jotai"

export const allEstimatedFeesAtom = atomFromRepo(estimatedFeesRepo)

export const estimatedFeesAtom = atomFamily(
  (transactions: Call | Call[]) =>
    atom(async (get) => {
      const estimatedFees = await get(allEstimatedFeesAtom)
      return estimatedFees.find((estimatedFee) =>
        isEqualTransactions(estimatedFee.transactions, transactions),
      )
    }),
  (a, b) => isEqualTransactions(a, b),
)
